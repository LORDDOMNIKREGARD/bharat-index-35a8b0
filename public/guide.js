// Shared behaviour for the static guides: a way back to the site, and reading position.
// ponytail: guides stay in the light theme; their own CSS hard-codes too many light colours
// for a clean dark mode. Move those to tokens first if dark guides are wanted.
;(function () {
  var title = document.title.split(/\s[—|-]\s/)[0]
  var bar = document.createElement('nav')
  bar.className = 'bi-bar'
  bar.setAttribute('aria-label', 'Site')
  bar.innerHTML = '<a href="/guides">← Bharat Index</a><span></span>'
  bar.querySelector('span').textContent = title
  document.body.insertBefore(bar, document.body.firstChild)

  var key = 'guide:' + location.pathname
  if (!location.hash) {
    try {
      var saved = JSON.parse(localStorage.getItem(key) || 'null')
      if (saved && saved.y > 0) window.scrollTo(0, saved.y)
    } catch (e) {}
  }

  var t
  window.addEventListener(
    'scroll',
    function () {
      clearTimeout(t)
      t = setTimeout(function () {
        var max = document.documentElement.scrollHeight - innerHeight
        try {
          localStorage.setItem(key, JSON.stringify({ y: Math.round(scrollY), pct: max > 0 ? Math.round((scrollY / max) * 100) : 0 }))
        } catch (e) {}
      }, 300)
    },
    { passive: true },
  )
})()
