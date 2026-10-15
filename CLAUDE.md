# VŠKK 10 let – project guide for Claude Code

Concept tester for the 10th-anniversary logo of VŠKK (Vysoká škola kreativní komunikace). It renders 11 logo concepts around the VŠKK square logo, restricted to a yellow / white / black palette and the Galano Grotesque typeface, and exports SVG and PNG. Static site deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`. UI copy is Czech.

## Files

- `index.html` – the whole app: markup, CSS and JS in one file. This is the live code.
- `vendor/opentype.min.js` – opentype.js, used by the SVG export to turn text into outlines.
- `vendor/montserrat/*.ttf`, `vendor/caveat/Caveat-Regular.ttf` (OFL, static 400 subset: Latin + Czech) – outline fonts for the SVG export (fallback for Galano, and the hand-written kind).
- `vendor/three.min.js` – three.js r128, used only by `kostka.html`.
- `logo/`, `assets/` – logo SVGs. `assets/vskk-logo-white.svg` (letters only) is embedded in `index.html` as `MARK_SRC` and tinted to the letter colour at draw time.
- `kostka.html` + `src/app.js`, `src/styles.css`, `vendor/opentype.min.js` – the earlier paper-cube studio (movable text, SVG export). Still live at `/kostka.html`; `index.html` does not use these files.

## Run

```bash
npm run dev   # http://localhost:5173
```

## Architecture (inside index.html)

- **State**: `st` (current concept, overview toggle, colour roles, texts, background, zoom/pan) and `params[conceptId]` (per-concept settings). Both persist to `localStorage` under `vskk-concepts-v1`. Uploaded fonts, logo and photo persist as data URLs under `vskk-font-*`, `vskk-logo`, `vskk-photo`.
- **Colours**: `PALETTE()` holds the only three colours (black, white, editable yellow, default VŠKK yellow `#fdc40a`). `C()` maps roles `bg`, `sq` (logo square), `let` (logo letters), `acc` (accent) to hex. Concepts must only use `C()` values (alpha variants via `rgba()` are fine for shadows).
- **Type**: `font(size, kind)` with kinds `light`, `reg`, `bold`, `hand`. Galano is licensed and not committed; uploaded Galano files register as families `GalanoL`, `GalanoR`, `GalanoB` with weight range `1 1000`; the fallback is Google Fonts Outfit. `capRatio(kind)` gives cap height per px (cache cleared when fonts load).
- **Logo**: `drawLogo(c, x, y, s, squareColour, letterColour)` fills the square and draws the official letter mark tinted to `letterColour` (falls back to typed letters if the mark fails to load). A user-uploaded logo image replaces the whole square.
- **Concepts**: the `CONCEPTS` array. Each entry has `id`, `name`, `src` (where the idea came from), `fit` (width × height in logo-square units, used for auto sizing), `params` (UI schema: range / select / toggle) and `draw(c, s, P, K)`, which draws centred on the origin with `s` = logo square size in px. Concept `puvodni` is a flat isometric cube (faces mapped with affine transforms, content via `faceContent`); it links to `kostka.html` for the full editor.
- **Rendering**: `paintConcept` for one concept, `paintOverview` for the grid; PNG export reuses both at 2× scale.
- **SVG export**: `SvgCtx` implements the subset of the Canvas 2D API the concepts use (transforms, paths, arcs, clip incl. evenodd, gradients, globalAlpha, blur filter, drawImage, fillText, letterSpacing) and records it as SVG, so every concept exports with no extra code. Paths are stored in page coordinates; text goes through `otFor(kind)` to opentype outlines (falls back to `<text>` if no font file); the VŠKK mark is inserted as its vector path via `c.svgPath`. Canvas-only tricks need an `if (c.isSvg)` branch, e.g. `pruhledne` uses `c.clipText` instead of compositing.
- **Galano**: uploaded files and, on localhost, `fonts/GalanoGrotesque-Regular.otf` / `-SemiBold.otf` (not committed) are used both for canvas and SVG outlines.

## Adding a concept

Add an object to `CONCEPTS` with the fields above. Keep the VŠKK square visible, use only `C()` colours and the `font()` kinds, and check it in the overview and in both the PNG and SVG export (open the SVG in a browser or Illustrator).
