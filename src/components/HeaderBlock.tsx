export function HeaderBlock() {
  return (
    <section className="bg-void-black pt-24 pb-16 px-6 flex flex-col items-center text-center font-inter select-none">
      {/* Eyebrow Status Line */}
      <span className="text-[12px] font-semibold text-electric-lime tracking-[0.1em] uppercase mb-8">
        // DECK OVERWATCH STATUS: ACTIVE
      </span>

      {/* Massive Display Headline */}
      <h1 className="text-[44px] md:text-[96px] font-black text-pure-white leading-[1.0] tracking-[-0.04em] max-w-[1000px] mb-8">
        BHARAT <span className="bg-electric-lime text-void-black px-4 py-1 md:px-6 md:py-2 rounded-lg inline-block">INDEX</span>
      </h1>

      {/* Subtext */}
      <p className="text-[18px] font-normal text-bone max-w-[640px] leading-[1.56] mb-12">
        A high-performance state intelligence registry. Instant query processing across political structure, economic output, and demographics.
      </p>

      {/* Hero Stack Controls */}
      <div className="flex flex-wrap justify-center gap-4">
        <a
          href="#explore"
          className="bg-electric-lime text-void-black text-[16px] font-bold rounded-lg px-6 py-3 hover:bg-lime-glow transition-all duration-200 shadow-sm border border-electric-lime"
        >
          Query Database
        </a>
        <a
          href="#explore"
          className="bg-transparent border border-iron text-paper text-[16px] font-bold rounded-lg px-6 py-3 hover:bg-carbon hover:border-steel transition-all duration-200"
        >
          Study Guides
        </a>
      </div>
    </section>
  )
}
