# ŞAHİ PORTFÖY — Premium Cinematic Website

World-class corporate website for **ŞAHİ PORTFÖY**, a luxury real estate brokerage. Built as a static SPA with cinematic scroll-driven animations, a glass navbar, and one signature 3D architectural centerpiece — without redesigning the spec'd layout, colors, typography, or sections.

## Stack

- **React 18 + Vite 5** — fast dev, tiny production build, deploys anywhere
- **GSAP 3 + ScrollTrigger** — scroll-driven reveals, parallax, pinned timelines
- **Lenis** — smooth scroll, synced to ScrollTrigger
- **React Three Fiber + Drei** — the gold wireframe building centerpiece
- **lucide-react** — clean, consistent icons

No backend, no DB, no CMS, no auth. Static only.

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Production build

```bash
npm run build
npm run preview
```

The output goes to `dist/` and is a fully static site.

## Deploy

### Vercel

Either push to GitHub and import on vercel.com, or run:

```bash
npx vercel --prod
```

`vercel.json` is included with `framework: 'vite'`.

### GitHub Pages

A workflow at `.github/workflows/deploy.yml` builds and pushes `dist/` to the `gh-pages` branch on every push to `main`. Or run:

```bash
npm run deploy
```

(bundled `gh-pages -d dist`).

## Contact

WhatsApp: **+90 541 841 79 85** → [wa.me/905418417985](https://wa.me/905418417985)

## Performance & accessibility

- Targets **60 FPS** on mid-range hardware.
- Respects `prefers-reduced-motion` — sections reveal instantly and the 3D centerpiece falls back to a static SVG.
- Semantic landmarks, keyboard-navigable nav, alt text on all images, WCAG-AA contrast.