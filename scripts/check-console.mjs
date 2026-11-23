import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await page.locator('.dock__home').click();
await page.waitForTimeout(400);
await page.locator('.music-card__play').click();
await page.locator('.music-card__controls button').last().click();
await page.waitForTimeout(200);
await page.locator('.dock__home').click();
await page.waitForTimeout(400);

console.log('console/page errors:', JSON.stringify(errors, null, 2));
await browser.close();
