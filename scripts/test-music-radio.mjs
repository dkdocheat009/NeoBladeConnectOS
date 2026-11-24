import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

// Open Music from Home
await page.getByText('Spotify', { exact: true }).click();
await page.waitForTimeout(300);
console.log('on music screen:', await page.locator('.music-screen').count());
console.log('track title:', await page.locator('.music-screen__title').innerText());

// shuffle/repeat toggle
await page.locator('[aria-label="Aleatório"]').click();
console.log('shuffle active:', await page.locator('[aria-label="Aleatório"]').getAttribute('aria-pressed'));

// next track
await page.locator('[aria-label="Próxima faixa"]').click();
await page.waitForTimeout(100);
console.log('track after next:', await page.locator('.music-screen__title').innerText());

// back to home
await page.locator('.back-button').click();
await page.waitForTimeout(300);
console.log('back on home:', await page.getByText('Google Maps', { exact: true }).count());

// Open Radio from Home
await page.getByText('Rádio', { exact: true }).click();
await page.waitForTimeout(300);
console.log('on radio screen:', await page.locator('.radio-screen').count());

// switch category
await page.getByText('ETS2', { exact: true }).click();
await page.waitForTimeout(100);
console.log('station in ETS2 list:', await page.getByText('ETS2 Radio', { exact: true }).count());

// select a station
await page.getByText('ETS2 Radio', { exact: true }).click();
await page.waitForTimeout(100);
console.log('current station name:', await page.locator('.radio-screen__name').innerText());
console.log('status:', await page.locator('.radio-screen__status').innerText());

// volume
await page.locator('[aria-label="Aumentar volume"]').click();
console.log('volume:', await page.locator('.radio-screen__volume-value').innerText());

// dock home button returns home directly
await page.locator('.dock__home').click();
await page.waitForTimeout(400);
console.log('back on home via dock:', await page.getByText('Google Maps', { exact: true }).count());

// navigate: Home -> Dashboard -> open music via dashboard card -> back -> dashboard
await page.locator('.dock__home').click(); // home -> dashboard
await page.waitForTimeout(400);
console.log('on dashboard:', await page.locator('.dashboard').count());
await page.locator('.music-card').click();
await page.waitForTimeout(400);
console.log('on music (from dashboard):', await page.locator('.music-screen').count());
await page.locator('.back-button').click();
await page.waitForTimeout(400);
console.log('back on dashboard (not home):', await page.locator('.dashboard').count());

console.log('errors:', JSON.stringify(errors));
await browser.close();
