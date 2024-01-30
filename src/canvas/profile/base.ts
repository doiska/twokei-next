import { createCanvas, loadImage } from "@napi-rs/canvas";
import { logger } from "@/lib/logger";

interface Props {
  avatar: string;
  background: {
    url: string | Buffer;
    blur?: number;
    brightness?: number;
  };
  border?: string;
}

export async function createProfile({ background }: Props) {
  logger.debug(`Creating profile card:`, {
    background,
  });

  const canvas = createCanvas(900, 300);
  const ctx = canvas.getContext("2d");

  ctx.roundRect(0, 0, 885, 303, [34]);
  ctx.clip();

  const base = await createBase(background);
  ctx.drawImage(base, 0, 0);

  return canvas.toBuffer("image/webp");
}

async function createBase(background: Props["background"]) {
  const canvas = createCanvas(885, 303);
  const ctx = canvas.getContext("2d");

  const backgroundImage = await loadImage(background.url);

  const bannerW = backgroundImage.width;
  const bannerH = backgroundImage.height;

  ctx.fillStyle = "#18191c";
  ctx.beginPath();
  ctx.fillRect(0, 0, 885, 303);
  ctx.fill();

  const blur = background.blur ?? 3;

  ctx.filter = [
    `brightness(${background.brightness ?? 100}%)`,
    `blur(${blur}px)`,
  ].join(" ");

  ctx.drawImage(backgroundImage, 0, 0, bannerW, bannerH, 0, 0, 885, 303);

  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#2a2d33";
  ctx.beginPath();
  ctx.fillRect(0, 0, 885, 303);
  ctx.fill();

  return canvas;
}
//https://github.com/iAsure/discord-arts/blob/master/src/utils/profile-image.utils.js
//https://github.com/unburn/greetify
//https://github.com/SrGobi/canvacard
//https://github.com/search?q=canvas+discord&type=repositories&p=8
async function createFrame() {
  const canvas = createCanvas(900, 300);
  const ctx = canvas.getContext("2d");
}
