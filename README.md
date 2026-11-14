# Best Shop — Suitcase e-shop

Multi-page online store built with HTML, SCSS and vanilla JavaScript (no frameworks).

## Pages

Home, Catalog (filters, sorting, search, pagination), Product Details, About Us, Contact Us, Cart.

## Prerequisites

- Node.js 18+ and npm

## Setup and run

    npm install
    npm run dev

`npm run dev` compiles SCSS into `dist/css`, watches for changes and opens
`src/index.html` in the browser with live reload.

## Other scripts

- `npm run compile` — one-time SCSS compilation
- `npm run lint` — ESLint (JS) and Stylelint (SCSS)
- `npm run lint:fix` — autofix lint issues

## Structure

    src/
      html/      inner pages
      js/        main.js (shared), page scripts
      scss/      abstracts, base, components, layouts, pages
      assets/    images, data.json
    dist/css/    compiled styles

## Notes

- Product data is loaded from `src/assets/data.json` with `fetch`,
  so the site must be opened through a server (`npm run dev`), not via `file://`.
- Cart and reviews are stored in LocalStorage.
