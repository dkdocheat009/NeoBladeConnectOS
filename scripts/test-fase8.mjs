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

const shot = (name) => page.screenshot({ path: `comparacoes/fase8_${name}.png` });

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await shot('01_home_page1');

// --- A) Home: paginação real + swipe + teclado -----------------------------
const dotsCount = await page.locator('.pagination__dot').count();
if (dotsCount !== 3) throw new Error(`Home: esperado 3 indicadores (quadrado + 2 páginas), encontrado ${dotsCount}.`);

// Clique no indicador abre a página 2 (só "Esportes", sem apps inventados)
await page.getByLabel('Página 2 de aplicativos').click();
await page.waitForTimeout(400);
await shot('02_home_page2');
if (!(await page.getByText('Esportes', { exact: true }).isVisible())) {
  throw new Error('Home: página 2 não mostrou o app esperado.');
}

// Arraste (swipe) volta para a página 1
const box = await page.locator('.main-carousel').boundingBox();
await page.mouse.move(box.x + 300, box.y + 400);
await page.mouse.down();
await page.mouse.move(box.x + 900, box.y + 400, { steps: 10 });
await page.mouse.up();
await page.waitForTimeout(400);
if (!(await page.getByText('Google Maps', { exact: true }).isVisible())) {
  throw new Error('Home: arraste (swipe) não voltou para a página 1.');
}

// Indicador quadrado abre o Dashboard
await page.getByLabel('Abrir Dashboard').first().click();
await page.waitForTimeout(400);
await shot('03_dashboard');
if (!(await page.locator('.dashboard').isVisible())) throw new Error('Home: indicador quadrado não abriu o Dashboard.');

// Seta do teclado volta para a Home (página 1)
await page.keyboard.press('ArrowRight');
await page.waitForTimeout(400);
if (!(await page.getByText('Google Maps', { exact: true }).isVisible())) {
  throw new Error('Home: seta do teclado não navegou de volta à Home.');
}

// Long press continua funcionando e não é disparado por um arraste rápido
const icon = await page.locator('.app-icon', { hasText: 'Rádio' }).boundingBox();
await page.mouse.move(icon.x + icon.width / 2, icon.y + icon.height / 2);
await page.mouse.down();
await page.waitForTimeout(750);
await page.mouse.up();
await page.waitForTimeout(150);
if ((await page.locator('.app-icon__remove').count()) === 0) {
  throw new Error('Home: pressionar e segurar não ativou o modo de edição.');
}
await shot('04_edit_mode');
await page.getByText('Concluir', { exact: true }).click();
await page.waitForTimeout(300);

// --- B) Dashboard: NavCard funcional ----------------------------------------
await page.getByLabel('Abrir Dashboard').first().click();
await page.waitForTimeout(400);
const firstInstruction = await page.locator('.nav-card__instruction').innerText();
await page.locator('.nav-card__steps').click();
await page.waitForTimeout(200);
const secondInstruction = await page.locator('.nav-card__instruction').innerText();
if (firstInstruction === secondInstruction) {
  throw new Error('Dashboard: os "três pontos" do NavCard não avançaram a manobra demonstrativa.');
}
await page.locator('.nav-card__open-hit').click();
await page.waitForTimeout(400);
if (!(await page.locator('.nav-screen').isVisible())) throw new Error('Dashboard: tocar no NavCard não abriu a Navegação.');
const fullScreenInstructionText = await page.locator('.nav-screen__instruction-text').innerText();
if (!fullScreenInstructionText.includes(secondInstruction)) {
  throw new Error('Dashboard/Navegação: a manobra não ficou sincronizada entre o cartão e a tela cheia.');
}
await shot('05_navegacao_sincronizada');
await page.locator('.back-button').click();
await page.waitForTimeout(400);

// --- C) Tema global real -----------------------------------------------------
await page.locator('.dock__shortcut[aria-label="Ajustes"]').click();
await page.waitForTimeout(400);
await page.getByText('Claro', { exact: true }).click();
await page.waitForTimeout(200);
await shot('06_ajustes_claro');
const themeAfterClick = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
if (themeAfterClick !== 'light') throw new Error('Tema: clicar em "Claro" não aplicou data-theme="light" no <html>.');

// Reflete em Notificações sem precisar remontar manualmente a árvore toda
await page.locator('.back-button').click();
await page.waitForTimeout(300);
await page.getByText('Notificações', { exact: true }).click();
await page.waitForTimeout(400);
await shot('07_notificacoes_claro');
const notifBg = await page.locator('.notificacoes-screen').evaluate((el) => getComputedStyle(el).backgroundColor);
if (notifBg.includes('0, 0, 0')) throw new Error('Tema: Notificações não refletiu o tema Claro global.');
await page.locator('.back-button').click();
await page.waitForTimeout(300);

// Persistência: recarrega a página e confirma que o tema continua Claro
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const themeAfterReload = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
if (themeAfterReload !== 'light') throw new Error('Tema: preferência Claro não persistiu após recarregar a página.');

// Volta para Escuro (estado padrão do projeto) antes de seguir
await page.locator('.dock__shortcut[aria-label="Ajustes"]').click();
await page.waitForTimeout(400);
await page.getByText('Escuro', { exact: true }).click();
await page.waitForTimeout(200);
await page.locator('.back-button').click();
await page.waitForTimeout(300);

// --- D) Acessibilidade: reduzir movimento tem efeito real -------------------
await page.locator('.dock__shortcut[aria-label="Ajustes"]').click();
await page.waitForTimeout(400);
await page.getByText('Acessibilidade', { exact: true }).click();
await page.waitForTimeout(200);
await page.locator('.ios-toggle').first().click();
await page.waitForTimeout(150);
const reduceMotionAttr = await page.evaluate(() => document.documentElement.getAttribute('data-reduce-motion'));
if (reduceMotionAttr !== 'true') throw new Error('Acessibilidade: "Reduzir movimento" não setou data-reduce-motion.');
await page.locator('.ios-toggle').first().click(); // desliga de novo
await page.locator('.back-button').click();
await page.waitForTimeout(300);

const realErrors = errors.filter((e) => !(e.includes('503') && e.includes('Service Unavailable')));
console.log('ERROS DE CONSOLE/PÁGINA:', errors.length ? JSON.stringify(errors, null, 2) : 'nenhum');
console.log(realErrors.length ? 'FALHOU' : 'OK — todas as verificações da Fase 8 passaram.');

await browser.close();
if (realErrors.length) process.exitCode = 1;
