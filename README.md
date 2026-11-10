# Bharat Index

State facts and study guides for IPM (IIM Integrated Programme in Management) interview prep.

- **States**: Chief Minister, Governor, Lok Sabha and Rajya Sabha seats, GSDP, CPI and inflation, sex ratio and rivers for all 28 states and 8 union territories. Every figure has a source and a date.
- **Who's who**: Prime Minister, Chief Justice, RBI Governor, repo rate and the Union Cabinet.
- **Study guides**: ten long-form references in `public/`, opened as plain HTML pages.
- **Headlines**: recent news from Google News, grouped by topic.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # data checks (ranks, sorting, river cleaning)
npm run build   # output in dist/
```

## Where things live

| Path | What |
|---|---|
| `state_data.json` | State data, written by `scraper.py` from Wikipedia and MoSPI |
| `src/data/index.ts` | Turns the JSON into the app's records: ISO codes, ranks, tile-map positions, cleaned rivers. Also the hand-maintained who's-who facts and the guide list |
| `public/tokens.css` | Colours and fonts, shared by the app and the guides |
| `public/guide.css`, `public/guide.js` | Shared skin for the guides: back link and saved reading position |
| `public/fonts/` | Anek Latin and Literata (SIL Open Font License; licences alongside) |

## Updating the data

1. Run `python scraper.py` to refresh `state_data.json`.
2. Check the `WHO` list in `src/data/index.ts` and update each `asOf` date you confirm.
3. Run `npm test`.

Deploys to Vercel as a static site; `vercel.json` sends unknown paths to the app.
