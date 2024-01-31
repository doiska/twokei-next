import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import Cabin from "./cabin_variable.ttf";

GlobalFonts.register(Cabin);

interface Badge {
  name: string;
  color: string;
  image?: string;
}

interface Props {
  user: {
    name: string;
    username: string;
    badges?: Badge[];
    ranking?: number;
  };
  avatar: string;
  background: {
    url: string | Buffer;
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
const FRAME_BORDER_RADIUS = 25;

const SAFE_ZONE_WIDTH = WIDTH - FRAME_OUTLINE_SIZE;
const SAFE_ZONE_HEIGHT = HEIGHT - FRAME_OUTLINE_SIZE;

const USER_PICTURE_BORDER_RADIUS = 25;
const USER_PICTURE_SIZE = SAFE_ZONE_HEIGHT - 50;

const SAFE_ZONE_DETAILS = USER_PICTURE_SIZE + 50;

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
  avatar,
  user,
}: Props) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const safeX = FRAME_OUTLINE_SIZE / 2;
  const safeY = FRAME_OUTLINE_SIZE / 2;

  const base = await createBase(background);
  ctx.drawImage(base, 0, 0);

  const border = await createOutline(outline);
  ctx.drawImage(border, 0, 0);

  const userPicture = await createUserPicture(avatar);
  ctx.drawImage(userPicture, safeX, safeY);

  const userDetails = await createUserDetails(user);
  ctx.drawImage(userDetails, 0, 0);

  ctx.roundRect(0, 0, WIDTH, HEIGHT, [25]);
  ctx.clip();

  ctx.filter = "drop-shadow(0px 4px 4px #000)";
  ctx.globalAlpha = 0.5;

  return canvas.toBuffer("image/webp");
}

async function createBase(background: Props["background"]) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const backgroundImage = await loadImage(background.url);

  ctx.roundRect(0, 0, WIDTH, HEIGHT, [FRAME_BORDER_RADIUS]);
  ctx.clip();

  const filters: string[] = [];

  if (background.blur) {
    filters.push(`blur(${background.blur}px)`);
  }

  if (background.brightness) {
    filters.push(`brightness(${background.brightness}%)`);
  }

  ctx.filter = filters.join(" ");

  ctx.drawImage(
    backgroundImage,
    FRAME_OUTLINE_SIZE / 2,
    FRAME_OUTLINE_SIZE / 2,
    SAFE_ZONE_WIDTH,
    SAFE_ZONE_HEIGHT,
  );

  return canvas;
}

async function createUserPicture(avatar: Props["avatar"]) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const avatarImage = await loadImage(avatar);

  const profileY = CENTER_Y - USER_PICTURE_SIZE / 2;
  console.log(CENTER_Y, USER_PICTURE_SIZE, profileY, SAFE_ZONE_HEIGHT);

  const profileX = 20;

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  ctx.roundRect(profileX, profileY, USER_PICTURE_SIZE, USER_PICTURE_SIZE, [
    USER_PICTURE_BORDER_RADIUS,
  ]);

  ctx.clip();

  ctx.drawImage(
    avatarImage,
    profileX,
    profileY,
    USER_PICTURE_SIZE,
    USER_PICTURE_SIZE,
  );

  ctx.stroke();
  ctx.closePath();

  return canvas;
}

async function createUserDetails(user: Props["user"]) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  const { name, username, badges, ranking } = user;

  const verticalCenter = (HEIGHT - 50) / 2;
  const marginLeft = SAFE_ZONE_DETAILS;

  ctx.font = "30px Cabin";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const drawBadges = badges?.map((b) => createBadge(b));

  const [badgeTopX, badgeTopY] = Positions.TOP_RIGHT;

  drawBadges?.sort((a, b) => a.width - b.width);

  // draw badges with a 10px gap between them horizontally, keep the Y same, they must not overlap
  drawBadges?.forEach((badge, i) => {
    ctx.drawImage(badge, badgeTopX - badge.width - 10 * (i + 1), badgeTopY);
  });

  ctx.fillText(name, marginLeft, verticalCenter - 20);
  ctx.fillText(username, marginLeft, verticalCenter + 20);

  if (ranking) {
    ctx.fillText(`#${ranking}`, marginLeft, verticalCenter + 60);
  }

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
  ctx.roundRect(0, 0, WIDTH, HEIGHT, [FRAME_BORDER_RADIUS]);
  ctx.stroke();
  ctx.closePath();

  return canvas;
}

function createBadge(badge: Badge, fontSizeInPixels = 20, padding = 15) {
  const text = badge.name;

  // make width fit the text and not be too wide

  const badgeWidth = (text.length * fontSizeInPixels) / 2 + padding * 2;
  const badgeHeight = fontSizeInPixels + padding;

  const canvas = createCanvas(badgeWidth, badgeHeight);

  const ctx = canvas.getContext("2d");

  ctx.font = `${fontSizeInPixels}px Cabin`;
  ctx.fontWeight = "bold";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  // Badge with a 10px padding, 10px margin, rounded, bg black with small opacity, white text, centered text x/y
  ctx.roundRect(0, 0, badgeWidth, badgeHeight, [10]);
  ctx.clip();
  ctx.fillStyle = `#${badge.color}`;
  ctx.fillRect(0, 0, badgeWidth, badgeHeight);
  ctx.closePath();

  // center text vertically in the box
  ctx.fillStyle = "white";
  ctx.textBaseline = "middle";
  ctx.fillText(text, badgeWidth / 2, badgeHeight / 2);
  ctx.closePath();

  console.log(`Badge created with text: ${text}`, {
    badgeWidth,
    badgeHeight,
  });

  return canvas;
}
