# Markettable — Claude Code Instructions

This project auto-generates an AI stock predictions website from a single JSON data file.

## How it works
- All data lives in `data/stocks.json`
- Run `npm run build` to regenerate `index.html`
- Push `index.html` to GitHub → site auto-updates at `shalevliv-cmyk.github.io/markettable/`

## Adding a new stock
1. Add the stock to `stocks[]` in `data/stocks.json`
2. Add predictions under each AI in `predictions`
3. Run `npm run build` → commit → push

## Prediction format
- `er1`, `er2`, `combined`: strings like `"+8%"` or `"+6–15%"`
- `confidence`: integer 0–100 (red <40, yellow 40–60, green >60)

## Deploy
```bash
npm run build
git add index.html data/stocks.json
git commit -m "your message"
git push
```

## Project structure
```
markettable/
├── data/stocks.json     ← THE ONLY FILE YOU EDIT
├── src/generate.js      ← HTML generator
├── index.html           ← AUTO-GENERATED
├── package.json
└── CLAUDE.md
```
