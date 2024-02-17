import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas";

//TODO: favorite genre badge
//TODO: favorite artist badge

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Cabin from "./cabin_variable.ttf";

GlobalFonts.register(Cabin);

interface Badge {
  name: string;
  color?: string;
  image?: string;
}

interface Props {
  user: {
    name: string;
    avatar: string;
    badges?: Badge[];
  };
  stats: {
    ranking: string;
    listenedSongs: string;
    totalPlayTime: string;
  };
  background: {
    url: string;
    blur?: number;
    brightness?: number;
  };
  outline?: {
    theme: string | string[];
    orientation?: "vertical" | "horizontal";
  };
  border?: string;
}

const WIDTH = 900;
const HEIGHT = 300;

const FRAME_OUTLINE_SIZE = 15;
const FRAME_BORDER_RADIUS = 0;

const SAFE_ZONE_WIDTH = WIDTH - FRAME_OUTLINE_SIZE;
const SAFE_ZONE_HEIGHT = HEIGHT - FRAME_OUTLINE_SIZE;

const USER_PICTURE_BORDER_RADIUS = 35;
const USER_PICTURE_SIZE = SAFE_ZONE_HEIGHT - 50;

const SAFE_ZONE_DETAILS_WIDTH = USER_PICTURE_SIZE + 50;

const CENTER_Y = SAFE_ZONE_HEIGHT / 2;
const CENTER_X = SAFE_ZONE_WIDTH / 2;

const Positions = {
  TOP_LEFT: [0, 0],
  TOP_CENTER: [CENTER_X, 0],
  TOP_RIGHT: [SAFE_ZONE_WIDTH, 0],
  MIDDLE_LEFT: [0, CENTER_Y],
  MIDDLE_CENTER: [CENTER_X, CENTER_Y],
  MIDDLE_RIGHT: [SAFE_ZONE_WIDTH, CENTER_Y],
  BOTTOM_LEFT: [0, SAFE_ZONE_HEIGHT],
  BOTTOM_CENTER: [CENTER_X, SAFE_ZONE_HEIGHT],
  BOTTOM_RIGHT: [SAFE_ZONE_WIDTH, SAFE_ZONE_HEIGHT],
} as const;

export async function createProfile({
  outline,
  background,
  stats,
  user,
}: Props) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = true;

  const safeX = FRAME_OUTLINE_SIZE / 2;
  const safeY = FRAME_OUTLINE_SIZE / 2;

  const base = await createBase(background);
  ctx.drawImage(base, 0, 0);

  const border = await createOutline(outline);
  ctx.drawImage(border, 0, 0);

  const userPicture = await createUserPicture(user.avatar);
  ctx.filter = "drop-shadow(0px 12px 16px rgba(0, 0, 0, 0.8))";

  ctx.drawImage(
    userPicture,
    safeX + 15,
    safeY + 25,
    USER_PICTURE_SIZE,
    USER_PICTURE_SIZE,
  );

  ctx.filter = "none";

  const userDetails = await createUserDetails(user, stats.ranking);
  ctx.drawImage(userDetails, 0, 0);

  const statsImage = createStats(stats);
  ctx.drawImage(statsImage, 0, 0);

  return canvas.toBuffer("image/webp");
}

async function createBase(background: Props["background"]) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const filters = [];

  if (background.brightness) {
    filters.push(`brightness(${background.brightness}%)`);
  }

  if (background.blur) {
    filters.push(`blur(${background.blur}px)`);
  }

  ctx.filter = filters.join(" ");

  ctx.imageSmoothingEnabled = true;
  ctx.globalCompositeOperation = "source-over";

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (background.url && background.url.startsWith("http")) {
    const backgroundImage = await loadImage(background.url);
    ctx.drawImage(backgroundImage, 0, 0, WIDTH + 100, HEIGHT + 100);
  }

  ctx.filter = "none";

  return canvas;
}

async function createUserPicture(avatar: string) {
  const canvas = createCanvas(1024, 1024);
  const ctx = canvas.getContext("2d");

  const avatarImage = await loadImage(avatar);

  ctx.imageSmoothingEnabled = true;

  ctx.roundRect(0, 0, 1024, 1024, [USER_PICTURE_BORDER_RADIUS]);
  ctx.clip();
  ctx.drawImage(avatarImage, 0, 0, 1024, 1024);
  ctx.closePath();

  return canvas;
}

async function createUserDetails(user: Props["user"], ranking: string) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const { name, badges } = user;

  const verticalCenter = (HEIGHT - 50) / 2;
  const marginLeft = SAFE_ZONE_DETAILS_WIDTH;

  ctx.font = "30px Cabin";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const [badgeTopX, badgeTopY] = Positions.TOP_RIGHT;

  const drawBadges =
    badges?.map((b) => createBadge(b)).sort((a, b) => a.width - b.width) ?? [];

  const badgeY = badgeTopY + 20;

  drawBadges.reduceRight((badgeX, badge) => {
    badgeX -= badge.width + 10;
    ctx.drawImage(badge, badgeX, badgeY);
    return badgeX;
  }, badgeTopX);

  ctx.font = "bold 30px Cabin";
  ctx.fillStyle = "white";

  const nameText = name.length > 20 ? `${name.slice(0, 20)}...` : name;
  const rankText = `Rank #${ranking}`;

  ctx.font = "bold 50px Cabin";
  ctx.fillStyle = "white";

  ctx.fillText(nameText, marginLeft, verticalCenter - 40);

  ctx.font = "bold 30px Cabin";

  ctx.fillStyle = "white";
  ctx.fillText(
    rankText,
    marginLeft + 5,
    verticalCenter - ctx.measureText(rankText).actualBoundingBoxAscent / 2 + 5,
  );

  const title = "Music bot: Twokei.com";
  ctx.font = "bold 20px Cabin";
  ctx.fillStyle = "white";
  ctx.textAlign = "right";
  ctx.fillText(title, SAFE_ZONE_WIDTH - 5, SAFE_ZONE_HEIGHT - 10);

  return canvas;
}

async function createOutline(outline: Props["outline"]) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const orientation = outline?.orientation ?? "horizontal";

  const gradX = orientation === "horizontal" ? 0 : WIDTH;
  const gradY = orientation === "horizontal" ? HEIGHT : 0;

  if (!outline?.theme) {
    return canvas;
  }

  const theme = Array.isArray(outline.theme) ? outline.theme : [outline.theme];
  const linearGradient = ctx.createLinearGradient(0, 0, gradX, gradY);

  for (let i = 0; i < theme.length; i++) {
    linearGradient.addColorStop(i, theme[i]);
  }

  ctx.strokeStyle = linearGradient;
  ctx.lineWidth = FRAME_OUTLINE_SIZE;

  // full rounded rectangle
  ctx.roundRect(0, 0, WIDTH, HEIGHT, [FRAME_BORDER_RADIUS]);
  ctx.stroke();
  ctx.closePath();

  return canvas;
}

function createBadge(
  badge: Badge,
  fontSizeInPixels = 20,
  padding = 15,
  position = "center",
) {
  const text = badge.name;

  const badgeWidth = (text.length * fontSizeInPixels) / 2 + padding * 2;
  const badgeHeight = fontSizeInPixels + padding;

  const canvas = createCanvas(badgeWidth, badgeHeight);

  const ctx = canvas.getContext("2d");

  ctx.font = `${fontSizeInPixels}px Cabin`;
  ctx.fontWeight = "bold";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  ctx.roundRect(0, 0, badgeWidth, badgeHeight, [10]);
  ctx.clip();
  ctx.fillStyle = badge.color ? `#${badge.color}` : "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, badgeWidth, badgeHeight);
  ctx.closePath();

  ctx.fillStyle = "white";
  ctx.textBaseline = "middle";

  // place text at start
  const x =
    position === "center"
      ? badgeWidth / 2
      : padding + ctx.measureText(text).width / 2;

  ctx.fillText(text, x, badgeHeight / 2);

  ctx.closePath();

  return canvas;
}

function createStats({
  listenedSongs,
  totalPlayTime,
}: {
  listenedSongs: string;
  totalPlayTime: string;
}) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const listenedSongsBadge = createBadge(
    {
      name: `Músicas ouvidas: ${listenedSongs}`,
    },
    24,
    10,
    "start",
  );

  const totalPlayTimeBadge = createBadge(
    {
      name: `Ouvindo no Twokei: ${totalPlayTime}`,
    },
    24,
    10,
    "start",
  );

  const [, centerY] = Positions.MIDDLE_CENTER;

  const startAtY = centerY + 40;

  ctx.drawImage(listenedSongsBadge, SAFE_ZONE_DETAILS_WIDTH, startAtY);
  ctx.drawImage(totalPlayTimeBadge, SAFE_ZONE_DETAILS_WIDTH, startAtY + 40);

  return canvas;
}
