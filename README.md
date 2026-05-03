# Ring

**Repository:** [github.com/shaeelabanuhussain/ring](https://github.com/shaeelabanuhussain/ring)

A single-page **sticky-scroll horror** experience built with **Vite**, **React 19**, **TypeScript**, and **Framer Motion**. Nine full-viewport scenes blend as you scroll; the finale uses a **randomized reveal window** each visit so the last beat does not land at a predictable scroll position. A full-viewport **“You survived”** epilogue follows the story block.

Inspired by the narrative flow of [horror_scroll](https://github.com/shaeelabanuhussain/horror_scroll) (without on-screen counters, progress bars, or spoiler text).

## Features

- **Sticky stage** — `useScroll` on `#horror-section` drives opacity across nine layered images.
- **Triangular blending** — each scene fades in and out over its share of scroll (first frame stays visible at scroll position `0` so the page is not black on load).
- **Random finale timing** — per page load, the window where scene 8 appears over scene 7 is chosen at random within safe bounds (respects `prefers-reduced-motion` with fixed bounds).
- **Full-viewport imagery** — `object-fit: cover` edge-to-edge during the story.
- **Atmosphere** — CRT flicker, scanlines, vignette, film noise; optional **flashlight** cursor (disabled when reduced motion is requested).
- **Asset fallbacks** — tries `.png`, then `.jpg`, `.jpeg`, `.webp` for each scene file.
- **Optional upscale script** — `sharp`-based resize to 4K for sources in `public/scenes-in/`.

## Quick start

```bash
git clone https://github.com/shaeelabanuhussain/ring.git
cd ring
npm install
npm run dev
```

Open the URL Vite prints (usually [http://localhost:5173](http://localhost:5173)).

**Production build**

```bash
npm run build
npm run preview
```

## Scene assets

Place **nine** images under **`public/scenes/`** using these base names (any supported extension on the first line that exists will load):

| `scene_0_0` | `scene_0_1` | `scene_0_2` |
| --- | --- | --- |
| `scene_1_0` | `scene_1_1` | `scene_1_2` |
| `scene_2_0` | `scene_2_1` | `scene_2_2` |

Example paths: `public/scenes/scene_0_0.png`, `public/scenes/scene_1_2.jpg`, …

If a file is still missing after all extensions are tried, a **dark placeholder** tile appears for that layer (no labels).

### Upscale helper

1. Add sources to `public/scenes-in/` with the same `scene_R_C` names.
2. Run:

```bash
npm run upscale-scenes
```

Outputs 3840×2160 cover crops into `public/scenes/`. Requires dev dependencies installed (`npm install`).

## Tuning

In [`src/components/RingStickyStory.tsx`](src/components/RingStickyStory.tsx):

| Constant | Role |
| --- | --- |
| `TOTAL_STORY_SCROLL_PX` | Vertical scroll distance for the horror section (default `3600`). Lower = faster run-through. |
| `randomRevealBounds()` | Randomizes where the final reveal sits in normalized scroll `[0, 1]`; adjust ranges inside that helper to taste. |

## Stack

- [Vite 6](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/) — scroll-linked motion

## Related

- [horror_scroll](https://github.com/shaeelabanuhussain/horror_scroll) — reference sticky-scroll horror UI and scene ordering.

## License

Add a `LICENSE` file to this repository if you want to specify terms for reuse of code or assets.
