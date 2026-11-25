// Fase 5 — Prioridade 0: comprova visualmente (não só por bounding box) o
// alinhamento do bloco relógio/sinal/5G/bateria do dock. Para cada horário
// e tela, salva: recorte da referência (home.png), recorte do app atual, e
// uma sobreposição (diff) lado a lado, em comparacoes/dock_check_*.png.
import { chromium } from 'playwright';
import { decodePNG, getPixel, encodePNG } from '../scripts-lib/png-lite.mjs';
import fs from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:5174/';
const REF_PATH = 'imagens/home.png';
const CROP = { x: 0, y: 0, w: 115, h: 140 };
const SCALE = 4;

function cropImg(img, x0, y0, w, h) {
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = getPixel(img, x0 + x, y0 + y);
      const idx = (y * w + x) * 4;
      rgba[idx] = p.r;
      rgba[idx + 1] = p.g;
      rgba[idx + 2] = p.b;
      rgba[idx + 3] = 255;
    }
  }
  return { width: w, height: h, pixels: rgba };
}

function scaleNN(c, s) {
  const w = c.width * s;
  const h = c.height * s;
  const rgba = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sx = Math.floor(x / s);
      const sy = Math.floor(y / s);
      const idx = (sy * c.width + sx) * 4;
      const oidx = (y * w + x) * 4;
      rgba[oidx] = c.pixels[idx];
      rgba[oidx + 1] = c.pixels[idx + 1];
      rgba[oidx + 2] = c.pixels[idx + 2];
      rgba[oidx + 3] = 255;
    }
  }
  return { width: w, height: h, pixels: rgba };
}

function diffImg(a, b) {
  const w = a.width;
  const h = a.height;
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const d =
      (Math.abs(a.pixels[i * 4] - b.pixels[i * 4]) +
        Math.abs(a.pixels[i * 4 + 1] - b.pixels[i * 4 + 1]) +
        Math.abs(a.pixels[i * 4 + 2] - b.pixels[i * 4 + 2])) /
      3;
    const v = Math.min(255, d * 2.2);
    rgba[i * 4] = v;
    rgba[i * 4 + 1] = v;
    rgba[i * 4 + 2] = v;
    rgba[i * 4 + 3] = 255;
  }
  return { width: w, height: h, pixels: rgba };
}

function hconcat(imgs, gap = 10) {
  const h = Math.max(...imgs.map((i) => i.height));
  const w = imgs.reduce((s, i) => s + i.width, 0) + gap * (imgs.length - 1);
  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = 30;
    rgba[i * 4 + 1] = 30;
    rgba[i * 4 + 2] = 30;
    rgba[i * 4 + 3] = 255;
  }
  let xoff = 0;
  for (const img of imgs) {
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const idx = (y * img.width + x) * 4;
        const oidx = (y * w + (x + xoff)) * 4;
        rgba[oidx] = img.pixels[idx];
        rgba[oidx + 1] = img.pixels[idx + 1];
        rgba[oidx + 2] = img.pixels[idx + 2];
        rgba[oidx + 3] = 255;
      }
    }
    xoff += img.width + gap;
  }
  return { width: w, height: h, pixels: rgba };
}

function save(img, path) {
  fs.writeFileSync(path, encodePNG(img.width, img.height, img.pixels));
}

const refFull = decodePNG(REF_PATH);
const refCrop = scaleNN(cropImg(refFull, CROP.x, CROP.y, CROP.w, CROP.h), SCALE);

async function captureScreen(browser, hour, minute, navigateFn, label) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.addInitScript(
    ({ h, m }) => {
      const fixed = new Date();
      fixed.setHours(h, m, 0, 0);
      const RealDate = Date;
      // eslint-disable-next-line no-global-assign
      Date = class extends RealDate {
        constructor(...args) {
          if (args.length === 0) super(fixed.getTime());
          else super(...args);
        }
        static now() {
          return fixed.getTime();
        }
      };
    },
    { h: hour, m: minute },
  );
  await page.goto(url, { waitUntil: 'networkidle' });
  if (navigateFn) await navigateFn(page);
  const buf = await page.screenshot({ clip: { x: CROP.x, y: CROP.y, width: CROP.w, height: CROP.h } });
  await page.close();

  // decode the PNG buffer we just captured, in-process (no temp file needed)
  fs.writeFileSync('comparacoes/_tmp_capture.png', buf);
  const captured = decodePNG('comparacoes/_tmp_capture.png');
  const curCrop = scaleNN(cropImg(captured, 0, 0, CROP.w, CROP.h), SCALE);
  const diff = diffImg(refCrop, curCrop);
  const row = hconcat([refCrop, curCrop, diff], 12);
  const outPath = `comparacoes/dock_check_${label}_${String(hour).padStart(2, '0')}${String(minute).padStart(2, '0')}.png`;
  save(row, outPath);
  console.log('saved', outPath);
}

const browser = await chromium.launch();
const times = [
  [9, 9],
  [12, 40],
  [17, 59],
];
const screens = [
  { label: 'home', nav: null },
  { label: 'dashboard', nav: async (p) => { await p.locator('.dock__home').click(); await p.waitForTimeout(400); } },
  {
    label: 'veiculo',
    nav: async (p) => {
      await p.getByText('Veículo', { exact: true }).click();
      await p.waitForTimeout(400);
    },
  },
];

for (const screen of screens) {
  for (const [h, m] of times) {
    await captureScreen(browser, h, m, screen.nav, screen.label);
  }
}

await browser.close();
fs.unlinkSync('comparacoes/_tmp_capture.png');
console.log('Ordem de cada imagem: [referência 4x | atual 4x | diff absoluto 4x]');
