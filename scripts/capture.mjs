import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] ?? 'http://localhost:5174/';
const outPath = process.argv[3] ?? 'comparacoes/atual.png';

mkdirSync('comparacoes', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
});
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: outPath });
await browser.close();
console.log('saved', outPath);
