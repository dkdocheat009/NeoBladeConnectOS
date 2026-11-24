import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('comparacoes', { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  permissions: [],
});
const page = await context.newPage();

const errors = [];
page.on('pageerror', (err) => errors.push(`pageerror: ${err}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
});

const shot = (name) => page.screenshot({ path: `comparacoes/fase5_${name}.png` });

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await shot('01_home');

// --- Navegação --------------------------------------------------------
await page.getByLabel('Google Maps').first().click();
await page.waitForTimeout(350);
await shot('02_navegacao_escura');
if (!(await page.locator('.nav-screen__instruction').isVisible())) {
  throw new Error('Navegação: cartão de instrução não visível no estado ativo.');
}

await page.getByLabel('Mais opções (alternar tema)').click();
await page.waitForTimeout(150);
await shot('03_navegacao_clara');
if (!(await page.locator('.nav-screen--claro').isVisible())) {
  throw new Error('Navegação: tema claro não aplicado após alternância.');
}

await page.getByLabel('Alternar visão geral da rota').click();
await page.waitForTimeout(150);
await shot('04_navegacao_visao_geral');
if (await page.locator('.nav-screen__instruction').isVisible()) {
  throw new Error('Navegação: cartão de instrução ainda visível na visão geral.');
}
await page.getByLabel('Alternar visão geral da rota').click();
await page.getByLabel('Mais opções (alternar tema)').click();

// --- Chamadas sobre a Navegação ----------------------------------------
await page.getByText('Simular chamada (teste)').click();
await page.waitForTimeout(150);
await shot('05_chamada_tocando');
if (!(await page.locator('.chamada-card--ringing').isVisible())) {
  throw new Error('Chamadas: cartão de chamada tocando não apareceu.');
}
await page.getByLabel('Atender').click();
await page.waitForTimeout(150);
await shot('06_chamada_ativa');
if (!(await page.locator('.chamada-card--active').isVisible())) {
  throw new Error('Chamadas: estado de chamada ativa não apareceu.');
}
await page.getByLabel('Encerrar chamada').click();
await page.waitForTimeout(2000);
if (await page.locator('.chamada-card').isVisible()) {
  throw new Error('Chamadas: cartão não desapareceu após encerrar.');
}

// --- Radar ---------------------------------------------------------------
await page.getByLabel('Abrir alertas de radar').click();
await page.waitForTimeout(350);
await shot('07_radar_livre');
if (!(await page.getByText('Estrada livre').isVisible())) {
  throw new Error('Radar: estado "estrada livre" não visível.');
}
await page.getByText('Simular radar à frente (teste)').click();
await page.waitForTimeout(150);
await shot('08_radar_alerta');
if (!(await page.getByText('Radar à frente').isVisible())) {
  throw new Error('Radar: estado de alerta não apareceu.');
}
await page.getByText('🎥 Reportar radar').click();
await page.waitForTimeout(150);
await shot('09_radar_reportado');
if (!(await page.getByText('Radar reportado').isVisible())) {
  throw new Error('Radar: confirmação de reporte não apareceu.');
}
await page.locator('.back-button').click();
await page.waitForTimeout(350);
if (!(await page.locator('.nav-screen').isVisible())) {
  throw new Error('Radar -> voltar: não retornou para a Navegação.');
}

// --- Assistente de voz (Siri) --------------------------------------------
await page.keyboard.down('Control');
await page.keyboard.down('Alt');
await page.keyboard.press('KeyV');
await page.keyboard.up('Alt');
await page.keyboard.up('Control');
await page.waitForTimeout(400);
await shot('10_assistente_voz');
if (!(await page.locator('.voice-overlay').isVisible())) {
  throw new Error('Assistente de voz: overlay não apareceu após Ctrl+Alt+V.');
}
await page.locator('.voice-card__dismiss').click();
await page.waitForTimeout(150);
if (await page.locator('.voice-overlay').isVisible()) {
  throw new Error('Assistente de voz: overlay não fechou ao clicar em dismiss.');
}

// --- Regressão: Home, Dashboard, Veículo, Trabalho, Clima, Música, Rádio --
await page.locator('.dock__home').click();
await page.waitForTimeout(350);
await shot('11_regressao_home');

await page.locator('.dock__home').click();
await page.waitForTimeout(350);
await shot('12_regressao_dashboard');
if (!(await page.locator('.dashboard-screen, [class*="dashboard"]').first().isVisible())) {
  throw new Error('Regressão: Dashboard não renderizou.');
}
await page.locator('.dock__home').click();
await page.waitForTimeout(350);

await page.getByLabel('Veículo').click();
await page.waitForTimeout(400);
await shot('13_regressao_veiculo');
await page.locator('.back-button').click();
await page.waitForTimeout(350);

await page.getByLabel('Trabalho').click();
await page.waitForTimeout(400);
await shot('14_regressao_trabalho');
await page.locator('.back-button').click();
await page.waitForTimeout(350);

// --- Esportes (Fase 6: só competições reais, sem seção de demonstração) ---
await page.getByText('Esportes', { exact: true }).click();
await page.waitForTimeout(400);
await shot('15_esportes_real_sem_chave');
if (!(await page.getByText('Conecte a fonte de resultados').isVisible())) {
  throw new Error('Esportes: estado honesto "Conecte a fonte de resultados" não apareceu sem chave.');
}
const leagueCount = await page.locator('.esportes-screen__league').count();
if (leagueCount !== 2) {
  throw new Error(`Esportes: esperado exatamente 2 competições (BSA/CL), encontrado ${leagueCount}.`);
}
if (await page.getByText('Demonstração').count()) {
  throw new Error('Esportes: rótulo/seção "Demonstração" ainda presente — deveria ter sido removida na Fase 6.');
}
await page.locator('.esportes-screen__league', { hasText: 'Champions' }).click();
await page.waitForTimeout(200);
await shot('16_esportes_champions');
await page.locator('.back-button').click();
await page.waitForTimeout(350);

// 503 em /api/football/... é o estado esperado quando nenhuma
// FOOTBALL_DATA_API_KEY está configurada (ver vite.config.ts) — não é uma
// regressão, é exatamente o "Conecte a fonte de resultados" testado acima.
const realErrors = errors.filter(
  (e) => !(e.includes('503') && (e.includes('football') || e.includes('Service Unavailable'))),
);

console.log('ERROS DE CONSOLE/PÁGINA:', errors.length ? JSON.stringify(errors, null, 2) : 'nenhum');
console.log(realErrors.length ? 'FALHOU' : 'OK — todas as verificações da Fase 5 passaram.');

await browser.close();
if (realErrors.length) process.exitCode = 1;
