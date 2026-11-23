import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

for (let i = 0; i < 7; i++) {
  await page.screenshot({ path: `comparacoes/brand_${i}.png`, clip: { x: 860, y: 160, width: 130, height: 170 } });
  await page.getByText('Veículo', { exact: true }).click();
  await page.waitForTimeout(150);
}

await browser.close();
console.log('done');
