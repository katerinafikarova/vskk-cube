# VŠKK cube – project guide for Claude Code

Interactive 3D mockup of a black origami paper cube for the 10th anniversary of VŠKK (Vysoká škola kreativní komunikace). Users turn the cube, drag text and logos across its faces, match the scene to a photo of yellow origami cranes and export a PNG. It is a static site deployed to GitHub Pages.

## Stack

- Plain HTML, CSS and JavaScript. No build step, no framework, no bundler.
- opentype.js **1.3.4**, vendored at `vendor/opentype.min.js` (global `opentype`), used only by the SVG export.
- three.js **r128**, vendored at `vendor/three.min.js` (UMD global `THREE`). Do not upgrade casually: r128 uses `outputEncoding`/`sRGBEncoding`; newer versions renamed these to `outputColorSpace`/`SRGBColorSpace` and changed lighting units.
- Cube type: **Galano Grotesque** (Regular 400, Medium 500, Semi Bold 600), self-hosted from `fonts/` via `@font-face` in `src/styles.css`. It is a commercial font, so `fonts/` is gitignored and never pushed: the public site falls back to Montserrat, and its SVG export keeps text as live `<text>`. Galano shows only when running locally with the OTFs in `fonts/`.
- Google Fonts: Archivo (UI), plus Montserrat, Space Grotesk and DM Serif Display as extra choices.
- The VŠKK mark is the official 2021 logo, never set as text. `assets/vskk-logo-white.svg` is the white-letters cut of it; `src/app.js` embeds the same path as a data URI (`LOGO`) so canvases stay untainted and export works, also on `file://`.

## Run locally

```bash
npm run dev      # serves on http://localhost:5173
npm run check    # syntax check of src/app.js
```

Opening `index.html` via `file://` works, but browsers block the self-hosted Galano fonts there, so type falls back to sans-serif. Use a local server to see real type.

## Files

- `index.html` – markup for the stage and the control panel.
- `src/styles.css` – UI styles. Colors are CSS variables on `:root` with a dark-mode override; keep new colors as variables.
- `src/app.js` – everything else, in one IIFE, in this order: state → helpers → paper textures → three.js scene → face drawing → picking & dragging → editor → scene controls → export → render loop → start.
- `vendor/three.min.js` – three.js r128.
- `fonts/` – Galano Grotesque OTFs. `assets/` – logo SVGs. `logo/` – standalone vector logo of the cube.
- `.github/workflows/pages.yml` – deploys the repo root to GitHub Pages on push to `main`.

## How it works

- **Faces are canvases.** Each of the 6 cube faces has a 1024×1024 canvas (`faceC[i]`) used as a `CanvasTexture`. `drawFace(i)` paints the paper texture, then every element on that face, then a multiply grain pass so ink picks up paper texture, then the dashed selection outline.
- **Face indices** follow three.js `BoxGeometry` material order: 0 right (+x), 1 left (−x), 2 top (+y), 3 bottom (−y), 4 front (+z), 5 back (−z).
- **Elements** live in the `elements` array: `{ id, type: 'text'|'image', text, font, weight, color, size, spacing, rot, opacity, x, y, face, img }`. `x`/`y` are 0–1 in canvas space (y down). `size` is font px for text, width px for images. `_w`/`_h` are measured during drawing and used for hit-testing.
- **Paper** is procedural (`genPaper(i)`): seeded noise + low-frequency mottling + fibres + fold creases, with a matching bump map in `bumpC[i]`. Seeds are per face so faces differ but stay stable between reloads.
- **Interaction**: pointer events raycast against the cube (`pick`) to get face + UV. A hit on an element starts a move (elements can cross onto other faces); otherwise the drag rotates the cube via world-axis quaternions.
- **Grounding**: each frame `settle()` puts the shadow plane and contact shadow under the lowest cube corner so the cube always rests on the surface.
- **SVG export** (`buildSvg`) projects the visible faces through the live camera and writes flat paths: face fill = paper colour, white strokes on edges shared by two visible faces, elements clipped per face. Points are projected one by one (Bézier control points included), so perspective matches the 3D view. Galano and Montserrat text becomes outlines via opentype.js (`VFONTS` maps family+weight to font files; Galano falls back to the subset static Montserrat TTFs in `vendor/montserrat/`, OFL); other fonts stay `<text>` with an affine transform; elements with `vec` (the VŠKK mark) are vector paths; uploaded images are embedded `<image>`s. No texture, grain or shadow.
- **Export** composites the background (gold gradient, uploaded photo with blur, or transparent) with the WebGL canvas at 2× and saves a PNG. Selection outlines are hidden during export.

## Conventions

- Keep it dependency-free and static; any new library goes into `vendor/` pinned to an exact version.
- UI copy is short, sentence case, in English. Brand colors: VŠKK yellow `#fdc40a` (ink and swatch), UI accent yellow `#f2b630`, paper black `#1e1e20`.
- After changes to `drawFace`, check both the selection outline and the export (outline must not appear in exports).
- Keep mobile working: the layout stacks under 820px, and the canvas uses `touch-action: none`.

## Ideas for next steps

- Save/load a scene as JSON (elements + cube rotation + settings).
- Preset camera angles matching the original concept photo.
- Rounded/softened cube edges (custom geometry) for a more folded-paper look.
- Image-based environment lighting from the uploaded background photo.
