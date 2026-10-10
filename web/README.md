# KITROOM web

The football clothing catalogue and order-request site, built from the Claude Design handoff in `../project/Kitroom.dc.html`.

Vite + React + TypeScript. Static site, no backend, no online payment.

## Run

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
```

## Configure

Copy `.env.example` to `.env` and set `VITE_SELLER_WHATSAPP` to the seller's number (digits only, e.g. `351912345678`).
"Send summary on WhatsApp" opens a chat with that number. If it is empty, the customer picks the chat.

## Structure

- `src/data/catalogue.ts`: loads `public/catalog.json` at startup. The importer in `../importer` generates that file and the photos in `public/catalog/`. If `catalog.json` is missing, the site uses the hand-written list in the same file, with colour illustrations instead of photos.
- `src/lib/store.tsx`: cart, favourites, customer details and the submitted order. The cart, favourites and customer details are saved in localStorage.
- `src/lib/order.ts`: builds the order preview and the WhatsApp text. The first message has the shirt image with size, name and Nº. The second message has everything else.
- `src/screens/*`: one file per screen. `src/components/*`: shared UI, the product card, KitArt, the sheets and the header/nav.

## Routes

`/`, `/catalogue`, `/categories`, `/league/:key`, `/category/:key`, `/product/:id`, `/favourites`, `/cart`, `/details`, `/review`, `/submitted`.

It's a single-page app, so the host must serve `index.html` for every path. `public/_redirects` handles this on Netlify.
