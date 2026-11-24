import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:5174/';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto(url, { waitUntil: 'networkidle' });

// --- VEÍCULO ---
await page.getByText('Veículo', { exact: true }).click();
await page.waitForTimeout(500);
console.log('[veiculo] screen open:', await page.locator('.veiculo-screen').count());
console.log('[veiculo] default brand:', await page.locator('.veiculo-screen__brand-name').count()); // 0 since default tab is condicao
await page.getByText('Cavalo Mecânico', { exact: true }).click();
await page.waitForTimeout(300);
const brand1 = await page.locator('.veiculo-screen__brand-name').innerText();
await page.getByText('Trocar marca (teste)', { exact: false }).click();
await page.waitForTimeout(300);
const brand2 = await page.locator('.veiculo-screen__brand-name').innerText();
console.log('[veiculo] brand changed on click:', brand1, '->', brand2, brand1 !== brand2);
await page.getByText('Reboque', { exact: true }).click();
await page.waitForTimeout(300);
console.log('[veiculo] trailer attached by default:', await page.locator('.veiculo-screen__trailer-name').count());
await page.getByText('Simular desacoplamento', { exact: false }).click();
await page.waitForTimeout(300);
console.log('[veiculo] empty state after detach:', await page.getByText('Nenhum reboque acoplado').count());
await page.locator('.back-button').click();
await page.waitForTimeout(300);
console.log('[veiculo] back to home:', await page.getByText('Google Maps', { exact: true }).count());

// --- TRABALHO ---
await page.getByText('Trabalho', { exact: true }).click();
await page.waitForTimeout(500);
console.log('[trabalho] screen open:', await page.locator('.trabalho-screen').count());
await page.getByText('Parada', { exact: true }).click();
await page.waitForTimeout(300);
console.log('[trabalho] stop detail shown:', await page.locator('.trabalho-screen__stop-detail').count());
await page.getByText('Detalhes', { exact: true }).click();
await page.waitForTimeout(300);
console.log('[trabalho] details cards:', await page.locator('.trabalho-screen__cards .stat-card').count());
await page.getByText('Concluir entrega', { exact: false }).click();
await page.waitForTimeout(300);
console.log('[trabalho] empty state after complete:', await page.getByText('Nenhum trabalho ativo').count());
await page.locator('.back-button').click();
await page.waitForTimeout(300);

// --- CLIMA (via dock) ---
await page.locator('.dock__shortcut').nth(3).click();
await page.waitForTimeout(500);
console.log('[clima] screen open:', await page.locator('.clima-screen').count());
await page.locator('.clima-screen__day').nth(2).click();
await page.waitForTimeout(300);
const cityHeading = await page.locator('.clima-screen__city').innerText();
console.log('[clima] day selected heading:', cityHeading);
await page.locator('.clima-screen__hour').nth(3).click();
await page.waitForTimeout(300);
console.log('[clima] hour selected heading:', await page.locator('.clima-screen__city').innerText());
await page.locator('.back-button').click();
await page.waitForTimeout(300);

// --- ESPORTES ---
// Fase 6: só competições reais (BSA/CL, football-data.org) — a seção
// "Demonstração" e as ligas fictícias foram removidas por completo. Sem
// FOOTBALL_DATA_API_KEY neste ambiente, valida-se o estado honesto de
// configuração e a troca de competição/aba, não dados reais.
await page.getByText('Esportes', { exact: true }).click();
await page.waitForTimeout(500);
console.log('[esportes] screen open:', await page.locator('.esportes-screen').count());
console.log('[esportes] leagues in sidebar (deve ser 2 — só BSA/CL):', await page.locator('.esportes-screen__league').count());
console.log('[esportes] estado honesto sem chave visivel:', await page.getByText('Conecte a fonte de resultados').isVisible());
await page.getByText('Tabela', { exact: true }).click();
await page.waitForTimeout(300);
console.log('[esportes] estado honesto na aba Tabela:', await page.getByText('Conecte a fonte de resultados').isVisible());
await page.getByText('Jogos', { exact: true }).click();
await page.waitForTimeout(300);
await page.locator('.esportes-screen__league', { hasText: 'Champions' }).click();
await page.waitForTimeout(300);
console.log('[esportes] competição trocada para:', await page.locator('.esportes-screen__title').innerText());
await page.locator('.back-button').click();
await page.waitForTimeout(300);
console.log('[esportes] back to home:', await page.getByText('Google Maps', { exact: true }).count());

// --- Dock contextual icon/dot regression (quick) ---
await page.getByText('Veículo', { exact: true }).click();
await page.waitForTimeout(500);
console.log('[dock] dot present while in Veículo:', await page.locator('.dock__dot').count());
await page.locator('.dock__home').click();
await page.waitForTimeout(300);
console.log('[dock] back home via dock button:', await page.getByText('Google Maps', { exact: true }).count());

console.log('errors:', JSON.stringify(errors));
await browser.close();
