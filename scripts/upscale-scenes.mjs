/**
 * One-off upscale: reads PNGs from public/scenes-in/ (any names),
 * writes 3840×2160 cover-fit PNGs to public/scenes/ as scene_R_C.png.
 *
 * Usage:
 *   Put sources in public/scenes-in/ (e.g. scene_0_0.png … scene_2_2.png)
 *   npm run upscale-scenes
 *
 * Requires: sharp (listed in devDependencies)
 */
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const inputDir = path.join(root, "public", "scenes-in");
const outDir = path.join(root, "public", "scenes");
const WIDTH = 3840;
const HEIGHT = 2160;

const namePattern = /^scene_(\d)_(\d)\.png$/i;

async function main() {
  await mkdir(outDir, { recursive: true });
  let files;
  try {
    files = await readdir(inputDir);
  } catch {
    console.error(
      `Missing folder ${path.relative(root, inputDir)} — create it and add PNGs (e.g. scene_0_0.png).`
    );
    process.exit(1);
  }

  const targets = files.filter((f) => namePattern.test(f));
  if (targets.length === 0) {
    console.error(
      `No scene_R_C.png files in ${path.relative(root, inputDir)}. Expected names like scene_0_0.png.`
    );
    process.exit(1);
  }

  for (const file of targets.sort()) {
    const m = file.match(namePattern);
    if (!m) continue;
    const src = path.join(inputDir, file);
    const dest = path.join(outDir, `scene_${m[1]}_${m[2]}.png`);
    await sharp(src)
      .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
      .png({ compressionLevel: 6 })
      .toFile(dest);
    console.log("Wrote", path.relative(root, dest));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
