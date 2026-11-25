import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

mkdirSync('comparacoes', { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, permissions: [] });
const page = await context.newPage();

const errors = [];
page.on('pageerror', (err) => errors.push(`pageerror: ${err}`));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
});

const shot = (name) => page.screenshot({ path: `comparacoes/fase7_${name}.png` });
const goHome = async () => {
  await page.locator('.back-button').click().catch(() => {});
  await page.waitForTimeout(400);
  // Fase 8: a Home virou um carrossel (ambas as páginas ficam montadas ao
  // mesmo tempo, só uma fica visível), então ".home-content" não é mais
  // único — "shell__main" sem "is-hidden" é o jeito confiável de saber que
  // estamos em Home/Dashboard.
  const onMain = await page.locator('.shell__main:not(.is-hidden)').isVisible();
  if (!onMain) {
    await page.locator('.dock__home').click();
    await page.waitForTimeout(400);
  }
};

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await shot('01_home');

// --- Abastecer e Descansar (Paradas) — antes inerte -------------------------
await page.getByText('Abastecer e Descansar', { exact: true }).click();
await page.waitForTimeout(500);
await shot('02_paradas_lista');
if (!(await page.locator('.paradas-screen').isVisible())) throw new Error('Paradas: tela não abriu.');
await page.getByText('Postos', { exact: true }).click();
await page.waitForTimeout(200);
await page.locator('.ios-search__input').fill('zzz-inexistente');
await page.waitForTimeout(200);
await shot('03_paradas_vazio');
if (!(await page.getByText('Nenhuma parada encontrada').isVisible())) {
  throw new Error('Paradas: estado vazio da busca não apareceu.');
}
await page.locator('.ios-search__input').fill('');
await page.getByText('Todos', { exact: true }).click();
await page.locator('.paradas-screen__card').first().click();
await page.waitForTimeout(200);
await shot('04_paradas_detalhe');
if (!(await page.locator('.paradas-screen__detail').isVisible())) throw new Error('Paradas: detalhe não abriu.');
await page.getByText('☆ Favoritar').click();
await page.locator('.paradas-screen__detail-actions .is-secondary').click();
await page.getByText('★ Favoritos').click();
await page.waitForTimeout(200);
await shot('05_paradas_favoritos');
if ((await page.locator('.paradas-screen__card').count()) !== 1) {
  throw new Error('Paradas: filtro de favoritos não isolou a parada favoritada.');
}
await goHome();

// --- Diário de Bordo — antes inerte -----------------------------------------
await page.getByText('Diário de Bordo', { exact: true }).click();
await page.waitForTimeout(500);
await shot('06_diario_viagens');
if (!(await page.locator('.diario-screen').isVisible())) throw new Error('Diário de Bordo: tela não abriu.');
await page.locator('.ios-list-row').first().click();
await page.waitForTimeout(200);
await shot('07_diario_detalhe');
if (!(await page.locator('.diario-screen__detail').isVisible())) throw new Error('Diário de Bordo: detalhe não abriu.');
await page.locator('.diario-screen__close').click();
await page.getByText('Resumo', { exact: true }).click();
await page.waitForTimeout(200);
await shot('08_diario_resumo');
if (!(await page.getByText('DISTÂNCIA TOTAL').isVisible())) throw new Error('Diário de Bordo: resumo não apareceu.');
await goHome();

// --- Ajustes: master-detail iOS 27 (substitui o painel de abas) ------------
await page.locator('.dock__shortcut[aria-label="Ajustes"]').click();
await page.waitForTimeout(500);
await shot('09_ajustes_aparencia');
if (!(await page.locator('.ajustes-screen').isVisible())) throw new Error('Ajustes: tela não abriu.');
const navRows = await page.locator('.ajustes-screen__nav-list .ios-list-row').count();
// Fase 8 acrescentou Acessibilidade e Privacidade (7 -> 9); Fase 9
// acrescentou Sistema e promoveu Integrações a seção própria (9 -> 11).
if (navRows !== 11) throw new Error(`Ajustes: esperado 11 seções, encontrado ${navRows}.`);
// Intensidade do Liquid Glass tem efeito real (CSS var no root).
const blurBefore = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ios-glass-blur'));
await page.locator('.ajustes-screen__slider').first().evaluate((input) => {
  // React rastreia o setter nativo de "value" do input — atribuir
  // diretamente não dispara o onChange; é preciso usar o setter nativo
  // antes de despachar o evento (caveat conhecido de React + automação).
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, '10');
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
await page.waitForTimeout(150);
const blurAfter = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ios-glass-blur'));
if (blurBefore === blurAfter) {
  throw new Error('Ajustes: alterar a intensidade da transparência não mudou --ios-glass-blur.');
}
await goHome();

// --- Smoke test: todo atalho visível da Home abre uma tela real -------------
const homeAppLabels = [
  'Google Maps',
  'Spotify',
  'Rádio',
  'Veículo',
  'Trabalho',
  'Notificações',
  'Mensagens',
  'Abastecer e Descansar',
  'Diário de Bordo',
  'Calendário',
  'Esportes',
];
for (const label of homeAppLabels) {
  await page.getByText(label, { exact: true }).click();
  await page.waitForTimeout(400);
  const stillOnHome = await page.locator('.shell__main:not(.is-hidden)').isVisible();
  if (stillOnHome) throw new Error(`Smoke test: "${label}" não navegou para nenhuma tela (ainda inerte).`);
  await goHome();
}

const realErrors = errors.filter((e) => !(e.includes('503') && e.includes('Service Unavailable')));
console.log('ERROS DE CONSOLE/PÁGINA:', errors.length ? JSON.stringify(errors, null, 2) : 'nenhum');
console.log(realErrors.length ? 'FALHOU' : 'OK — todas as verificações da Fase 7 passaram.');

await browser.close();
if (realErrors.length) process.exitCode = 1;
