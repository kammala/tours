# Mamotour

Phone-first walking-tour app. Static build, deployed to GitHub Pages by `.github/workflows/deploy.yml`
(repo Settings → Pages → Source: GitHub Actions).

```sh
pnpm install
pnpm dev      # http://localhost:5173
pnpm test
pnpm build
```

## Adding a tour

Create `tours/<country>/<city>-<tour>.yaml`; the build validates it against `src/data/schema.ts`
and fails with the offending field. Any text field takes `{en, ru}`; a missing language falls back to the other.
See `tours/netherlands/amsterdam-detailed.yaml` for every field in use.
Tours list in file-name order, so prefix a multi-day trip's files with the day (`tours/italy/01-bologna-stopover.yaml`).

- `lat`/`lng`: right-click the place in Google Maps and copy the coordinates.
- `approach`: stops between the previous point and this one; `inside`: walk within the point, last entry is the exit.
- Names without a comma get `place_suffix` appended for Google Maps; use `place` for an exact address.
- Long streets resolve to an arbitrary spot along them; pin such vias as `{name: Amstelveenseweg, lat: …, lng: …}`.
- `audio: {ru: audio/<country>/<tour>/01.mp3}`: a narration player in the point details, for that language only; files go in `public/audio/`.
- Pictures go in `long` as Markdown images; Wikimedia Commons thumbnails are cached for offline use.
- `radius_m` (default 150): how close you must be for the point to auto-select; raise it for parks and districts.

Link to a point directly: `#/tour/<country>/<city>-<tour>/<point number>`.
