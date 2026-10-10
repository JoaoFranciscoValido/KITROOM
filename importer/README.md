# KITROOM catalogue importer

Imports the supplier's Yupoo albums into the website, in bulk:

- self-hosted WebP photos in `web/public/catalog/<product-slug>/` (`cover.webp`, `image-01.webp`, `image-02.webp`, …)
- `web/public/catalog.json`, which the website loads at startup
- a report of what was imported, updated, skipped and failed, in `importer/reports/`

The importer is a separate Node project. The website only reads `catalog.json` and the image files, and never uses Yupoo image URLs.

Only run it for photos you are authorised to reuse.

## Setup

```sh
cd importer
npm install
npx playwright install chromium   # once: the browser the importer drives
```

Yupoo blocks plain HTTP scraping and image hotlinking, so the importer loads the pages in a real browser (Playwright) and downloads each photo inside that browser session.

## Run

```sh
npm run import                          # full import
npm run import -- --limit 10            # first 10 albums only (good for a first try; stops listing once it has 10)
npm run import -- --category "retro"    # only Yupoo categories whose name contains "retro"
npm run import -- --album 123456789     # one album by its Yupoo id
npm run import -- --dry-run --limit 5   # list what would be imported; downloads and writes nothing
npm run import -- --headed              # show the browser window (useful if Yupoo changes its pages)
npm test                                # offline end-to-end test against a local mock store
```

## What it does

1. Opens `https://minkang.x.yupoo.com/albums`, reads the category links, then every album in every category (following `?page=N`), and finally the full album list to catch albums outside any category.
   With `--limit N` it stops listing as soon as it knows N albums, so a trial run takes a minute or two instead of crawling the whole store; those albums only carry the categories seen so far, and the next full run fills in the rest.
2. Opens each album, scrolls to load every photo and reads the full-size photo URLs. Password-protected albums and albums without photos are skipped and listed in the report.
3. Downloads each photo with the album page as Referer, hashes it (SHA-1) and stores identical photos only once per album.
4. Converts to WebP (max 1200 px wide; cover 640 px) and saves through the storage driver. Size charts (a table on a white page) are moved to the end of the gallery, so the cover and the first photo are always a product photo when the album has one.
5. Builds one catalogue item per album and writes `catalog.json` atomically.

Each item has the requested fields, plus the fields the website uses for its filters:

```json
{
  "id": "yupoo-123456789",
  "name": "Sporting CP 26/27 Home Player Version Jersey",
  "category": "⚽💪🏻Player Version",
  "sourceUrl": "https://minkang.x.yupoo.com/albums/123456789?uid=1",
  "coverImage": "/catalog/sporting-cp-26-27-home-player-version-jersey/cover.webp",
  "images": ["/catalog/sporting-cp-26-27-home-player-version-jersey/image-01.webp", "…"],
  "description": "",
  "availableSizes": ["S", "M", "L", "XL", "XXL"],
  "availability": "unknown",
  "slug": "sporting-cp-26-27-home-player-version-jersey",
  "siteCategory": "club",
  "team": "Sporting CP", "league": "Liga Portugal", "country": "Portugal",
  "season": "2026/27", "type": "Shirt", "variant": "Player version"
}
```

- `id` is stable (the Yupoo album id), and `slug` never changes once assigned, so links and carts survive re-imports.
- `name` is the album title without size ranges and emoji.
- Team, league, country, season, type and version are guessed from the title (`lib/teams.mjs`, `lib/catalog.mjs`). `siteCategory` maps the Yupoo categories to the site's categories (`categoryMap` in `config.json`).
- `availability` is `unknown` (shown as "On request") until you set it in `overrides.json`.

## Updating the catalogue

Run `npm run import` again.

- New albums are added; new photos in existing albums are downloaded. Photos already stored are not downloaded again (`state.json` remembers each photo's source and hash).
- Albums that no longer exist are kept but marked `"availability": "unavailable"`, which hides them on the site. This only happens on a full, error-free run, never with `--limit`, `--category` or `--album`.
- Manual edits go in `overrides.json`, keyed by product id; they are reapplied on every import:

```json
{
  "yupoo-123456789": { "description": "Official 26/27 home shirt.", "availability": "in", "availableSizes": ["M", "L", "XL"] },
  "yupoo-987654321": { "hidden": true }
}
```

Then commit `web/public/catalog.json`, `web/public/catalog/` and `importer/state.json`, and redeploy the site.

## Configuration (`config.json`)

- `source.baseUrl`: the Yupoo store.
- `output.dir`: where `catalog.json` and `catalog/` go (default `../web/public`).
- `images`: sizes, WebP quality, `maxPerAlbum`.
- `requests`: pause between pages (`delayMs`), retries, timeout and parallel image downloads. Keep the pause so the store is not overloaded.
- `defaultSizes`: sizes given to every product.
- `selectors`: CSS selectors for Yupoo's pages. If Yupoo changes its layout and albums or photos stop being found, adjust these (run with `--headed` to look at the page).
- `categoryMap`: Yupoo category name (lower case, partial match) to site category key.

## Changing storage (Cloudinary, Supabase Storage, Amazon S3)

All storage goes through `lib/storage/`. A driver implements `put(key, buffer, contentType) → public URL`, `exists(key)`, `url(key)`, `list(prefix)` and `remove(key)`. To move the photos:

1. Add `lib/storage/s3.mjs` (or `cloudinary.mjs`, `supabase.mjs`) implementing those functions.
2. Register it in `lib/storage/index.mjs` and set `"storage": { "driver": "s3", … }` in `config.json`.

`catalog.json` then contains that service's URLs, and the website needs no change.
