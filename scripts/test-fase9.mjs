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

const shot = (name) => page.screenshot({ path: `comparacoes/fase9_${name}.png` });

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

// --- Tema agora alcança as telas CarPlay com marca própria (não só Ajustes/listas iOS) ---
await page.locator('.dock__shortcut[aria-label="Ajustes"]').click();
await page.waitForTimeout(400);
await shot('01_ajustes_aparencia_cards');
if ((await page.locator('.ajustes-theme-card').count()) !== 3) {
  throw new Error('Ajustes: esperado 3 cartões de prévia de tema (Claro/Escuro/Automático).');
}
await page.locator('.ajustes-theme-card--claro').click();
await page.waitForTimeout(200);
await page.locator('.back-button').click();
await page.waitForTimeout(300);

await page.getByText('Veículo', { exact: true }).click();
await page.waitForTimeout(400);
await shot('02_veiculo_claro');
const veiculoBg = await page
  .locator('.veiculo-screen__panel')
  .first()
  .evaluate((el) => getComputedStyle(el).backgroundImage);
if (!veiculoBg || veiculoBg === 'none') throw new Error('Veículo: sem fundo no tema Claro (regressão do token de tema).');
await page.locator('.back-button').click();
await page.waitForTimeout(300);

await page.locator('.dock__shortcut[aria-label="Clima"]').click();
await page.waitForTimeout(400);
const climaBg = await page.locator('.clima-screen').evaluate((el) => getComputedStyle(el).backgroundImage);
if (!climaBg || climaBg === 'none') throw new Error('Clima: continua sem fundo próprio (bug relatado na Fase 9).');
await page.locator('.back-button').click();
await page.waitForTimeout(300);

// Volta para Escuro (estado padrão do projeto) antes de seguir.
await page.locator('.dock__shortcut[aria-label="Ajustes"]').click();
await page.waitForTimeout(400);
await page.locator('.ajustes-theme-card--escuro').click();
await page.waitForTimeout(200);
await page.locator('.back-button').click();
await page.waitForTimeout(300);

// --- Ajustes: novas seções Sistema/Integrações + relógio 12h/24h real ---
await page.locator('.dock__shortcut[aria-label="Ajustes"]').click();
await page.waitForTimeout(400);
const navRows = await page.locator('.ajustes-screen__nav-list .ios-list-row').count();
if (navRows !== 11) throw new Error(`Ajustes: esperado 11 seções (Fase 9 soma Sistema+Integrações), encontrado ${navRows}.`);
await page.getByText('Sistema', { exact: true }).click();
await page.waitForTimeout(200);
await page.getByText('12 horas (AM/PM)', { exact: true }).click();
await page.waitForTimeout(200);
await page.locator('.back-button').click();
await page.waitForTimeout(300);
const clockText = await page.locator('.status-bar__clock').innerText();
if (!/AM|PM/.test(clockText)) throw new Error(`Sistema: formato 12h não refletiu no relógio do dock (leu "${clockText}").`);

// volta para 24h (estado padrão) para não afetar outras checagens/scripts
await page.locator('.dock__shortcut[aria-label="Ajustes"]').click();
await page.waitForTimeout(400);
await page.getByText('Sistema', { exact: true }).click();
await page.waitForTimeout(200);
await page.getByText('24 horas', { exact: true }).click();
await page.waitForTimeout(200);
await page.locator('.back-button').click();
await page.waitForTimeout(300);

// --- Siri e Voz: controles reais (velocidade/brilho/duração) + lista de Vozes ---
await page.locator('.dock__shortcut[aria-label="Ajustes"]').click();
await page.waitForTimeout(400);
await page.getByText('Siri e Voz', { exact: true }).click();
await page.waitForTimeout(200);
await shot('03_siri_controles');
if ((await page.locator('.ajustes-screen__slider').count()) < 3) {
  throw new Error('Siri e Voz: esperados sliders de velocidade/brilho/duração.');
}
if (!(await page.getByText('Navegador (Web Speech)').isVisible())) {
  throw new Error('Siri e Voz: lista de Vozes não mostrou o provedor Web Speech.');
}
if ((await page.getByText('Não instalado', { exact: true }).count()) < 1) {
  throw new Error('Siri e Voz: provedores locais/nuvem deveriam aparecer honestamente como "Não instalado".');
}
await page.locator('.back-button').click();
await page.waitForTimeout(300);

// --- Siri visual: cartão compacto no canto inferior esquerdo (não mais um toast largo centralizado) ---
await page.keyboard.press('Control+Alt+v');
await page.waitForTimeout(700);
await shot('04_siri_card');
const cardBox = await page.locator('.voice-card').boundingBox();
if (!cardBox) throw new Error('Assistente: cartão não apareceu.');
if (cardBox.width > 500) throw new Error('Assistente: cartão ainda está largo/centralizado (esperado um cartão compacto).');
if (cardBox.x > 300) throw new Error('Assistente: cartão deveria estar ancorado perto do dock (canto inferior esquerdo).');
await page.waitForTimeout(2200);

// --- Home: roda do mouse horizontal também pagina (Fase 9) ---
await page.mouse.move(640, 400);
await page.mouse.wheel(400, 0);
await page.waitForTimeout(450);
if (!(await page.getByText('Esportes', { exact: true }).isVisible())) {
  throw new Error('Home: roda do mouse horizontal não trocou de página.');
}
await page.mouse.wheel(-400, 0);
await page.waitForTimeout(450);
if (!(await page.getByText('Google Maps', { exact: true }).isVisible())) {
  throw new Error('Home: roda do mouse horizontal não voltou para a primeira página.');
}

// --- Música: "Fila" abre uma lista real (não só um aviso) e troca de faixa ---
await page.getByText('Spotify', { exact: true }).click();
await page.waitForTimeout(300);
await page.getByText('Fila', { exact: true }).click();
await page.waitForTimeout(200);
const queueRows = await page.locator('.music-screen__queue-row').count();
if (queueRows < 2) throw new Error('Música: "Fila" não listou a playlist de demonstração.');
await page.locator('.music-screen__queue-row').nth(1).click();
await page.waitForTimeout(150);
const titleAfter = await page.locator('.music-screen__title').innerText();
if (titleAfter === 'Highway Nights') throw new Error('Música: selecionar uma faixa na Fila não trocou a faixa tocando.');
await page.locator('.back-button').click();
await page.waitForTimeout(300);

// --- Esportes: segmented control legível nos dois temas (bug encontrado e corrigido nesta fase) ---
await page.getByText('Esportes', { exact: true }).click();
await page.waitForTimeout(300);
const tabsCount = await page.locator('.segmented__option').count();
if (tabsCount !== 2) throw new Error('Esportes: segmented control Jogos/Tabela não encontrado.');

const realErrors = errors.filter((e) => !(e.includes('503') && e.includes('Service Unavailable')));
console.log('ERROS DE CONSOLE/PÁGINA:', errors.length ? JSON.stringify(errors, null, 2) : 'nenhum');
console.log(realErrors.length ? 'FALHOU' : 'OK — todas as verificações da Fase 9 passaram.');

await browser.close();
if (realErrors.length) process.exitCode = 1;
