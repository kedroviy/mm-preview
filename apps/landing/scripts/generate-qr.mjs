import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";

const root = process.cwd();
const publicDir = path.join(root, "public");
const outFile = path.join(publicDir, "qr-google-play.svg");

const defaultUrl = "https://play.google.com/store/apps/details?id=com.moviematcher";
const playUrlRaw = process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL;
const playUrl =
  typeof playUrlRaw === "string" && playUrlRaw.trim().length > 0
    ? playUrlRaw.trim()
    : defaultUrl;

await fs.mkdir(publicDir, { recursive: true });

const svg = await QRCode.toString(playUrl, {
  type: "svg",
  margin: 0,
  errorCorrectionLevel: "M",
  color: {
    dark: "#111827",
    light: "#FFFFFF",
  },
});

await fs.writeFile(outFile, svg, "utf8");
process.stdout.write(`Generated ${path.relative(root, outFile)} for ${playUrl}\n`);

