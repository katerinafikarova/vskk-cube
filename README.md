# VŠKK 10 let – paper cube studio

An interactive 3D paper cube for the VŠKK 10th anniversary. Turn the cube, drag text and logos across its faces, match the light to your own photo and export a high-resolution PNG.

## Run

```bash
npm run dev
```

Then open http://localhost:5173. No install step is needed.

## Deploy

Push to `main` on GitHub, then in **Settings → Pages** set *Source* to **GitHub Actions**. The included workflow publishes the site.

## Use

- Drag the cube to turn it, scroll to zoom.
- Click a text or logo and drag it, even onto another face. Arrow keys nudge (Shift for bigger steps), Delete removes.
- Add your own logo (PNG or SVG), upload a background photo, then **Export PNG**.

Everything runs in the browser; uploaded files never leave your computer. three.js © the three.js authors, MIT License.
