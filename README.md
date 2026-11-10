# Bharat Index

State facts and study guides for IPM (IIM Integrated Programme in Management) interview prep.

- **States**: Chief Minister, Governor, Lok Sabha and Rajya Sabha seats, GSDP, CPI and inflation, sex ratio and rivers for all 28 states and 8 union territories. Every figure has a source and a date.
- **Who's who**: Prime Minister, Chief Justice, RBI Governor, repo rate and the Union Cabinet.
- **Study guides**: ten long-form references in `public/`, opened as plain HTML pages.
- **Map**: a zoomable map of India. Tap a state to zoom in and see each Lok Sabha constituency, marked if reserved for SC or ST.
- **Practice**: ten-question map rounds with per-state mastery (Attempted, Familiar, Proficient, Mastered). States you miss come back more often.
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
| `public/data/india-map.json` | Projected outlines of the 36 states/UTs and one point per Lok Sabha seat, built by `scripts/build-map.mjs` from [DataMeet maps](https://github.com/datameet/maps) (CC BY 4.0) |
| `src/components/ui/` | shadcn/ui components, plus the Aceternity timeline; `BlurText`, `CountUp` and `SpotlightCard` are from React Bits |
| `public/fonts/` | Anek Latin and Literata (SIL Open Font License; licences alongside) |

## Updating the data

1. Run `python scraper.py` to refresh `state_data.json`.
2. Check the `WHO` list in `src/data/index.ts` and update each `asOf` date you confirm.
3. Run `npm test`.

To rebuild the map, download `States/Admin2.*` and `parliamentary-constituencies/india_pc_2019_simplified.geojson` (saved as `pc.geojson`) from datameet/maps into one folder, then run `node scripts/build-map.mjs <folder>`.

## Credits

- Map boundaries and constituencies: DataMeet India community, CC BY 4.0
- UI: shadcn/ui, Motion, React Bits (MIT + Commons Clause), Aceternity UI
- Fonts: Anek Latin and Literata, SIL Open Font License

Deploys to Vercel as a static site; `vercel.json` sends unknown paths to the app.
