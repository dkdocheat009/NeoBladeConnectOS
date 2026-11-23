import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

// Badge cycling: Notificações starts at 0 (no badge), click cycles to 1.
console.log('badges before:', await page.locator('.badge').allTextContents());
await page.getByText('Notificações', { exact: true }).click();
await page.waitForTimeout(150);
console.log('badges after 1 click on Notificações:', await page.locator('.badge').allTextContents());

// Brand cycling: click Veículo repeatedly, capture alt text/label state via aria on img.
for (let i = 0; i < 3; i++) {
  await page.getByText('Veículo', { exact: true }).click();
  await page.waitForTimeout(120);
}
await page.screenshot({ path: 'comparacoes/vehicle_fallback.png' });

// Navigate to Dashboard via dock bottom button.
await page.locator('.dock__home').click();
await page.waitForTimeout(500);
await page.screenshot({ path: 'comparacoes/dashboard_fase2.png' });

// Toggle music play/pause and next track.
await page.locator('.music-card__controls button', { hasText: '' }).first();
const playBtn = page.locator('.music-card__play');
await playBtn.click();
await page.waitForTimeout(150);
await page.screenshot({ path: 'comparacoes/dashboard_paused.png' });

// Go back to Home.
await page.locator('.dock__home').click();
await page.waitForTimeout(500);
await page.screenshot({ path: 'comparacoes/back_to_home.png' });

await browser.close();
