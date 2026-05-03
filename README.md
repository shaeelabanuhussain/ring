# Ring — sticky-scroll story

Vite + React + Framer Motion single page: **nine triangular scroll-blended scenes** (same narrative order and copy as the reference [horror_scroll](https://github.com/shaeelabanuhussain/horror_scroll) `Home.tsx`), **CRT / scanline / vignette / noise** overlays, optional **flashlight cursor**, progress UI, then a **dedicated reveal band** where the penultimate image stays up while the **final face** fades in; after that the sticky section ends and **post-horror** copy appears below.

## Setup

```bash
npm install
npm run dev
```

## Scene images

Put nine image files in **`public/scenes/`** next to `index.html`’s sibling `public` folder (not under `src/`). Names must match exactly (extension can be **`.png`**, **`.jpg`**, **`.jpeg`**, or **`.webp`** — the app tries those in order):

| Files |
| --- |
| `scene_0_0.png` … `scene_0_2.png` |
| `scene_1_0.png` … `scene_1_2.png` |
| `scene_2_0.png` … `scene_2_2.png` |

If a file is missing, a **placeholder** tile shows that scene id instead of a broken icon.

Recommended export size: **3840×2160** (optional). The stage uses `object-fit: contain`.

### Upscale helper (local)

1. Put smaller sources in `public/scenes-in/` using the same names.
2. Run `npm run upscale-scenes` (see [`scripts/upscale-scenes.mjs`](scripts/upscale-scenes.mjs)).

## Tuning

In [`src/components/RingStickyStory.tsx`](src/components/RingStickyStory.tsx):

- **`TOTAL_STORY_SCROLL_PX`** — total scroll length of the horror block (default `3600`).
- **`REVEAL_START_DEFAULT` / `REVEAL_END_DEFAULT`** — scroll progress window `[0,1]` where scene 7 stays full and scene 8 ramps in; after `REVEAL_END` only the finale stays until the section scrolls away.

Reduced motion widens the reveal window and disables the flashlight.

## Stack

- React 19 + TypeScript + Vite
- [Framer Motion](https://www.framer.com/motion/) — `useScroll` on `#horror-section`
- Reference UX: [shaeelabanuhussain/horror_scroll](https://github.com/shaeelabanuhussain/horror_scroll)
