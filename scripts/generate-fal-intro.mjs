import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fal } from "@fal-ai/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const qaDir = path.join(rootDir, "qa");
const imagePath = path.join(qaDir, "mobile-idle.png");
const outputPath = path.join(qaDir, "fal-intro.mp4");

if (!process.env.FAL_KEY) {
  throw new Error("FAL_KEY is required.");
}

fal.config({
  credentials: process.env.FAL_KEY,
});

const imageBuffer = await readFile(imagePath);
const imageFile = new File([imageBuffer], "triagezero-finish.png", { type: "image/png" });
const imageUrl = await fal.storage.upload(imageFile);

const result = await fal.subscribe("fal-ai/minimax/hailuo-02/standard/image-to-video", {
  input: {
    prompt:
      "A premium vertical product teaser for an AI orchestration app on a phone. Slow cinematic push-in, subtle parallax in the interface, elegant neon lime and cyan reflections, ambient data pulses, polished product-commercial lighting, serious premium software product tone, controlled motion.",
    image_url: imageUrl,
    duration: "6",
    resolution: "768P",
    prompt_optimizer: true,
  },
  logs: true,
  onQueueUpdate(update) {
    if (update.status === "IN_PROGRESS" && update.logs) {
      for (const log of update.logs) {
        console.log(log.message);
      }
    }
  },
});

const data = result.data;
const candidate =
  data?.video?.url ||
  data?.video_url ||
  data?.videos?.[0]?.url ||
  data?.output?.video?.url ||
  data?.output?.url;

if (!candidate) {
  console.log(JSON.stringify(data, null, 2));
  throw new Error("Could not find a downloadable video URL in fal response.");
}

await mkdir(qaDir, { recursive: true });
const response = await fetch(candidate);
if (!response.ok) {
  throw new Error(`Failed to download generated video: ${response.status}`);
}

const arrayBuffer = await response.arrayBuffer();
await writeFile(outputPath, Buffer.from(arrayBuffer));

console.log(outputPath);
