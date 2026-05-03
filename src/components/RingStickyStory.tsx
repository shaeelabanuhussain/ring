import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import "./RingStickyStory.css";

/** Scroll distance after the first viewport while the stage stays pinned. */
export const TOTAL_STORY_SCROLL_PX = 3600;

const SCENE_COUNT = 9;

/** Try these extensions in order (uploads are often `.jpg`). */
const SCENE_EXT = [".png", ".jpg", ".jpeg", ".webp"] as const;

/** Scene ids → files under `public/scenes/`. */
export const SCENES = [
  { id: "scene_0_0" },
  { id: "scene_0_1" },
  { id: "scene_0_2" },
  { id: "scene_1_0" },
  { id: "scene_1_1" },
  { id: "scene_1_2" },
  { id: "scene_2_0" },
  { id: "scene_2_1" },
  { id: "scene_2_2" },
] as const;

function randomRevealBounds(): { start: number; end: number } {
  const start = 0.6 + Math.random() * 0.2;
  const minGap = 0.08;
  const end = Math.min(0.98, start + minGap + Math.random() * 0.14);
  return { start, end };
}

/** Triangular window per scene (horror_scroll calculateOpacities). */
function triangularOpacities(p: number): number[] {
  const op: number[] = [];
  for (let i = 0; i < SCENE_COUNT; i++) {
    const imageStart = i / SCENE_COUNT;
    const imageEnd = (i + 1) / SCENE_COUNT;
    const imageMid = (imageStart + imageEnd) / 2;
    let opacity = 0;
    if (p >= imageStart && p <= imageEnd) {
      if (p <= imageMid) {
        opacity =
          i === 0
            ? 1
            : (p - imageStart) / (imageMid - imageStart);
      } else {
        opacity = 1 - (p - imageMid) / (imageEnd - imageMid);
      }
    }
    op.push(Math.max(0, Math.min(1, opacity)));
  }
  return op;
}

function horrorOpacities(
  p: number,
  revealStart: number,
  revealEnd: number
): number[] {
  if (p >= revealEnd) {
    return Array.from({ length: SCENE_COUNT }, (_, i) =>
      i === SCENE_COUNT - 1 ? 1 : 0
    );
  }
  if (p >= revealStart) {
    const span = Math.max(0.001, revealEnd - revealStart);
    const t = Math.max(0, Math.min(1, (p - revealStart) / span));
    const o = Array(SCENE_COUNT).fill(0) as number[];
    o[7] = 1;
    o[8] = t;
    return o;
  }
  return triangularOpacities(p);
}

export function RingStickyStory() {
  const containerRef = useRef<HTMLElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [revealBounds] = useState(randomRevealBounds);
  const [opacities, setOpacities] = useState<number[]>(() =>
    horrorOpacities(0, revealBounds.start, revealBounds.end)
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showFlashlight, setShowFlashlight] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<number>>(() => new Set());
  const [extIndex, setExtIndex] = useState<number[]>(() =>
    Array.from({ length: SCENE_COUNT }, () => 0)
  );

  const revealStart = reduceMotion ? 0.7 : revealBounds.start;
  const revealEnd = reduceMotion ? 0.9 : revealBounds.end;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const applyProgress = useCallback(
    (p: number) => {
      setOpacities(horrorOpacities(p, revealStart, revealEnd));
    },
    [revealStart, revealEnd]
  );

  useMotionValueEvent(scrollYProgress, "change", applyProgress);
  useEffect(() => {
    applyProgress(scrollYProgress.get());
  }, [applyProgress, scrollYProgress]);

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setShowFlashlight(true);
    };
    const onLeave = () => setShowFlashlight(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [reduceMotion]);

  const height = `calc(100vh + ${TOTAL_STORY_SCROLL_PX}px)`;

  const sceneSrc = (index: number) =>
    `/scenes/${SCENES[index].id}${SCENE_EXT[extIndex[index] ?? 0]}`;

  const onImgError = useCallback((index: number) => {
    setExtIndex((prev) => {
      const next = [...prev];
      const ei = next[index] ?? 0;
      if (ei < SCENE_EXT.length - 1) {
        next[index] = ei + 1;
        return next;
      }
      setBrokenImages((b) => new Set(b).add(index));
      return prev;
    });
  }, []);

  return (
    <>
      <article
        id="horror-section"
        ref={containerRef}
        className="ring-story"
        style={{ height }}
      >
        <div className="ring-story__stage">
          <div className="ring-story__frame">
            <div className="ring-story__stack" aria-hidden>
              {SCENES.map((scene, i) => (
                <motion.img
                  key={`${scene.id}-${extIndex[i] ?? 0}`}
                  src={sceneSrc(i)}
                  alt=""
                  className="ring-story__img"
                  draggable={false}
                  initial={false}
                  animate={{
                    opacity: opacities[i],
                    scale: i === 8 ? 0.97 + 0.03 * opacities[8] : 1,
                    filter: reduceMotion
                      ? "saturate(0.88) contrast(1.05)"
                      : opacities[i] > 0.04 && opacities[i] < 0.96
                        ? "saturate(0.72) contrast(1.12) blur(0.25px)"
                        : "saturate(0.8) contrast(1.1)",
                  }}
                  transition={{
                    duration: reduceMotion ? 0.28 : 0.14,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onError={() => onImgError(i)}
                />
              ))}
              {SCENES.map((scene, i) =>
                brokenImages.has(i) ? (
                  <div
                    key={`ph-${scene.id}`}
                    className="ring-story__placeholder"
                    style={{ opacity: opacities[i] }}
                    aria-hidden
                  />
                ) : null
              )}
            </div>

            <div className="ring-story__crt" aria-hidden />
            <div className="ring-story__scanlines" aria-hidden />
            <div className="ring-story__vignette" />
            <div className="ring-story__noise" aria-hidden />

            {!reduceMotion && showFlashlight && (
              <div
                className="ring-story__flashlight"
                style={
                  {
                    "--mx": `${mousePos.x}px`,
                    "--my": `${mousePos.y}px`,
                  } as CSSProperties
                }
                aria-hidden
              />
            )}
          </div>
        </div>
      </article>

      <section className="ring-post" aria-labelledby="post-horror-title">
        <div className="ring-post__inner">
          <h2 id="post-horror-title" className="ring-post__title">
            YOU SURVIVED
          </h2>
          <p className="ring-post__lede">But something remains...</p>
          <div className="ring-post__block">
            <h3 className="ring-post__h3">THE EXPERIENCE</h3>
            <p className="ring-post__p">
              What you witnessed was only the beginning. The entity has crossed
              the threshold between worlds. It knows where you are. It knows what
              you fear.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
