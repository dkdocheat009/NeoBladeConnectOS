import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

// A partir da Fase 4, a troca de marca acontece dentro do app Veículo,
// aba "Cavalo Mecânico" (clique no atalho da Home só abre o app).
await page.getByText('Veículo', { exact: true }).click();
await page.waitForTimeout(400);
await page.getByText('Cavalo Mecânico', { exact: true }).click();
await page.waitForTimeout(200);

for (let i = 0; i < 7; i++) {
  await page.screenshot({ path: `comparacoes/brand_${i}.png`, clip: { x: 980, y: 60, width: 300, height: 260 } });
  await page.getByText('Trocar marca (teste)', { exact: false }).click();
  await page.waitForTimeout(150);
}

await browser.close();
console.log('done');
