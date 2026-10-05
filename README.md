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

- `lat`/`lng`: right-click the place in Google Maps and copy the coordinates.
- `approach`: stops between the previous point and this one; `inside`: walk within the point, last entry is the exit.
- Names without a comma get `place_suffix` appended for Google Maps; use `place` for an exact address.
- Long streets resolve to an arbitrary spot along them; pin such vias as `{name: Amstelveenseweg, lat: …, lng: …}`.
- `radius_m` (default 150): how close you must be for the point to auto-select; raise it for parks and districts.

Link to a point directly: `#/tour/<country>/<city>-<tour>/<point number>`.
