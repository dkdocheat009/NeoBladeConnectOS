import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:5174/';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto(url, { waitUntil: 'networkidle' });

await page.getByText('Veículo', { exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'comparacoes/fase4_veiculo.png' });
await page.locator('.back-button').click();
await page.waitForTimeout(400);

await page.getByText('Trabalho', { exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'comparacoes/fase4_trabalho.png' });
await page.locator('.back-button').click();
await page.waitForTimeout(400);

await page.getByText('Esportes', { exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'comparacoes/fase4_esportes.png' });
await page.locator('.back-button').click();
await page.waitForTimeout(400);

// Clima via dock weather slot (4th dock shortcut)
await page.locator('.dock__shortcut').nth(3).click();
await page.waitForTimeout(400);
await page.screenshot({ path: 'comparacoes/fase4_clima.png' });

await browser.close();
console.log('done');
