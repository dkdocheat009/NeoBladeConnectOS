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

const shot = (name) => page.screenshot({ path: `comparacoes/fase6_${name}.png` });

await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await shot('01_home');

// --- Esportes: só competições reais, sem seção de demonstração ----------
await page.getByText('Esportes', { exact: true }).click();
await page.waitForTimeout(500);
await shot('02_esportes_sem_chave');
const leagueCount = await page.locator('.esportes-screen__league').count();
if (leagueCount !== 2) throw new Error(`Esportes: esperado 2 competições (BSA/CL), encontrado ${leagueCount}.`);
if (await page.getByText('Demonstração').count()) {
  throw new Error('Esportes: seção/rótulo "Demonstração" ainda presente — deveria ter sido removida.');
}
if (!(await page.getByText('Conecte a fonte de resultados').isVisible())) {
  throw new Error('Esportes: estado honesto não apareceu sem chave.');
}
await page.locator('.back-button').click();
await page.waitForTimeout(500);

// --- Mensagens -------------------------------------------------------------
await page.getByText('Mensagens', { exact: true }).click();
await page.waitForTimeout(500);
await shot('03_mensagens_recentes');
if (!(await page.locator('.mensagens-screen').isVisible())) throw new Error('Mensagens: tela não abriu.');
await page.getByText('Não lidas', { exact: true }).click();
await page.waitForTimeout(200);
await shot('04_mensagens_nao_lidas');
await page.locator('.mensagens-screen .ios-list-row').first().click();
await page.waitForTimeout(200);
await shot('05_mensagens_detalhe');
if (!(await page.locator('.mensagens-screen__detail').isVisible())) {
  throw new Error('Mensagens: detalhe da mensagem não abriu.');
}
await page.getByText('🎙️ Ditar resposta').click();
await page.waitForTimeout(300);
if (!(await page.getByText('Ditando resposta…').isVisible())) {
  throw new Error('Mensagens: estado de ditado não apareceu.');
}
await page.locator('.back-button').click();
await page.waitForTimeout(500);

// --- Notificações + banner transitório -------------------------------------
await page.getByText('Notificações', { exact: true }).click();
await page.waitForTimeout(500);
await shot('06_notificacoes_lista');
await page.getByText('Simular notificação (teste)').click();
await page.waitForTimeout(200);
await shot('07_notificacoes_banner');
if (!(await page.locator('.notification-banner').isVisible())) {
  throw new Error('Notificações: banner transitório não apareceu ao simular.');
}
await page.getByText('Limpar tudo').click();
await page.waitForTimeout(200);
await shot('08_notificacoes_vazio');
if (!(await page.getByText('Nenhuma notificação.').isVisible())) {
  throw new Error('Notificações: estado vazio não apareceu após limpar tudo.');
}
await page.getByText('Repor notificações de exemplo (teste)').click();
await page.waitForTimeout(200);
await page.locator('.back-button').click();
await page.waitForTimeout(500);

// --- Calendário --------------------------------------------------------------
await page.getByText('Calendário', { exact: true }).click();
await page.waitForTimeout(500);
await shot('09_calendario_hoje');
if (!(await page.locator('.calendario-screen').isVisible())) throw new Error('Calendário: tela não abriu.');
await page.getByText('Próximos dias', { exact: true }).click();
await page.waitForTimeout(200);
await shot('10_calendario_proximos');
await page.locator('.calendario-screen .ios-list-row').nth(2).click();
await page.waitForTimeout(200);
await shot('11_calendario_dia_vazio');
if (!(await page.getByText('Nenhum compromisso neste dia.').isVisible())) {
  throw new Error('Calendário: estado "nenhum compromisso" não apareceu no dia vazio esperado.');
}
await page.locator('.back-button').click();
await page.waitForTimeout(500);

// --- Ajustes (antes "Configurações") ----------------------------------------
await page.locator('.dock__shortcut[aria-label="Ajustes"]').click();
await page.waitForTimeout(500);
await shot('12_ajustes_aparencia');
if (!(await page.locator('.ajustes-screen').isVisible())) throw new Error('Ajustes: tela não abriu.');
if (!(await page.getByText('Ajustes', { exact: true }).isVisible())) {
  throw new Error('Ajustes: título "Ajustes" não apareceu (renomeação de Configurações pendente).');
}
await page.getByText('Siri e Voz', { exact: true }).click();
await page.waitForTimeout(200);
const assistantToggle = page.locator('.ios-toggle').first();
await assistantToggle.click();
await page.waitForTimeout(150);
if (await page.locator('.voice-button').count()) {
  throw new Error('Ajustes: desativar o assistente deveria esconder o botão de voz.');
}
await assistantToggle.click();
await page.waitForTimeout(150);
if (!(await page.locator('.voice-button').count())) {
  throw new Error('Ajustes: reativar o assistente deveria mostrar o botão de voz de novo.');
}
await page.getByText('Home e Apps', { exact: true }).click();
await page.waitForTimeout(150);
await shot('13_ajustes_apps');
// Busca funcional: filtra a lista de seções.
await page.locator('.ios-search__input').fill('aparência');
await page.waitForTimeout(150);
if ((await page.locator('.ajustes-screen__nav-list .ios-list-row').count()) !== 1) {
  throw new Error('Ajustes: busca não filtrou a lista de seções corretamente.');
}
await page.locator('.ios-search__input').fill('');
await page.locator('.back-button').click();
await page.waitForTimeout(500);

// --- Assistente de voz: novo cartão flutuante -------------------------------
await page.locator('.voice-button').click();
await page.waitForTimeout(400);
await shot('14_siri_card_erro');
if (!(await page.locator('.voice-card').isVisible())) throw new Error('Assistente: cartão flutuante não apareceu.');
if (!(await page.locator('.voice-overlay__ring').isVisible())) {
  throw new Error('Assistente: anel de brilho nas bordas não apareceu (deveria ter sido preservado).');
}
await page.locator('.voice-card__dismiss').click();
await page.waitForTimeout(200);
if (await page.locator('.voice-card').isVisible()) throw new Error('Assistente: cartão não fechou ao clicar em dismiss.');

const realErrors = errors.filter((e) => !(e.includes('503') && e.includes('Service Unavailable')));
console.log('ERROS DE CONSOLE/PÁGINA:', errors.length ? JSON.stringify(errors, null, 2) : 'nenhum');
console.log(realErrors.length ? 'FALHOU' : 'OK — todas as verificações da Fase 6 passaram.');

await browser.close();
if (realErrors.length) process.exitCode = 1;
