# as-portfolio

Interactive portfolio — Vite + React + TypeScript. A cursor-lit 3D scene: a rolling name prism, four draggable link cubes, and a field of tumbling satellite mini-cubes that drift, collide, and light up.

## Develop

```bash
npm install
npm run dev      # local dev server with hot reload
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
```

## Edit content

Everything swappable lives in `src/config.ts` (typed):

| What | Where |
|---|---|
| Accent color | `theme.accent` |
| Name lines (rolling bar) | `nameLines` |
| Links, icons, order | `links` (SVG strings from e.g. simpleicons.org) |
| Bio, photo, education line | `about` |
| Motion (parallax, tilt, drag spring) | `motion` |

Photo: drop `profile.jpg` into `public/assets/`. Resume: replace `public/resume.pdf`.

## Interactions

- **Name bar**: auto-rolls through the lines; grab and drag up/down to spin it yourself; click opens About.
- **Link cubes**: lean toward the cursor from a distance; click flips to a label then navigates; **grab one and drag it** — it moves within a radius and springs back on release.

## Deploy (GitHub Pages)

The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`.

One-time setup: repo **Settings → Pages → Source: GitHub Actions** (not "deploy from branch").

The custom domain is preserved via `public/CNAME` (currently `aayushsangani.me`), so it survives every deploy.
