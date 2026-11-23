import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:5173/';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(url, { waitUntil: 'networkidle' });

await page.getByText('Spotify', { exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'comparacoes/music_screen.png' });

await page.locator('.back-button').click();
await page.waitForTimeout(400);

await page.getByText('Rádio', { exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'comparacoes/radio_screen.png' });

await browser.close();
console.log('done');
