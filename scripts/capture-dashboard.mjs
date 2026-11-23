import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:5174/';
const outPath = process.argv[3] ?? 'comparacoes/dashboard.png';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('.dock__home').click();
await page.waitForTimeout(400);
await page.screenshot({ path: outPath });
await browser.close();
console.log('saved', outPath);
