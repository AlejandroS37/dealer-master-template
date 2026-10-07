import { mkdir, stat, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import { mediaSources } from "../src/config/mediaAssets.ts";
const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "public", "media");
await mkdir(output, { recursive: true });
for (const [key, filename] of Object.entries(mediaSources)) {
  const source = path.join(root, filename),
    target = path.join(output, filename.replace(/\.png$/i, ".webp"));
  const sourceStat = await stat(source);
  try {
    const current = await stat(target);
    if (current.mtimeMs >= sourceStat.mtimeMs && current.size > 0) continue;
  } catch {
    /* First preparation. */
  }
  if (filename.endsWith(".mp4")) {
    const result = spawnSync(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        source,
        "-an",
        "-vf",
        "scale=1280:-2",
        "-c:v",
        "libx264",
        "-crf",
        "23",
        "-preset",
        "medium",
        "-movflags",
        "+faststart",
        "-y",
        target,
      ],
      { stdio: "inherit" },
    );
    if (result.error?.code === "ENOENT") {
      await copyFile(source, target);
      console.log("ffmpeg unavailable; using original supplied video.");
    } else if (result.status !== 0)
      throw Error("Could not optimize supplied cinematic video.");
  } else {
    await sharp(source)
      .resize({
        width: key === "brand" ? 1672 : 1600,
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(target);
  }
  console.log(`Prepared ${filename} → public/media/${path.basename(target)}`);
}
