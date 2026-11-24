import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

// Fase 6: badges refletem o estado real de Mensagens/Notificações (não há
// mais um ciclo de contagem mock) e clicar no ícone abre o app de verdade.
console.log('badges (contagem real de não lidos):', await page.locator('.badge').allTextContents());
await page.getByText('Notificações', { exact: true }).click();
await page.waitForTimeout(500);
console.log('abriu a tela de Notificações:', await page.locator('.notificacoes-screen').count());
await page.locator('.back-button').click();
await page.waitForTimeout(400);
console.log('voltou para a Home:', await page.locator('.home-content').count());

// Nota: a partir da Fase 4, clicar em "Veículo" abre o app Veículo (a troca
// de marca agora acontece dentro dele, aba "Cavalo Mecânico") — coberto em
// scripts/test-fase4-apps.mjs, não mais aqui.

// Navigate to Dashboard via dock bottom button (a partir da Home).
await page.locator('.dock__home').click();
await page.waitForTimeout(500);
await page.screenshot({ path: 'comparacoes/dashboard_fase2.png' });

// Toggle music play/pause and next track.
const playBtn = page.locator('.music-card__play');
await playBtn.click();
await page.waitForTimeout(150);
await page.screenshot({ path: 'comparacoes/dashboard_paused.png' });

// Go back to Home.
await page.locator('.dock__home').click();
await page.waitForTimeout(500);
await page.screenshot({ path: 'comparacoes/back_to_home.png' });

await browser.close();
