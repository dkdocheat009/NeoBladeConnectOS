import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });

const mapsIcon = page.getByText('Google Maps', { exact: true });
const box = await mapsIcon.boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y - 60; // icon glyph sits above the label

// Short click should NOT trigger edit mode — it should open the app normally
// instead (desde a Fase 5, "Google Maps" abre a Navegação de verdade).
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.up();
await page.waitForTimeout(150);
console.log('short click opened Navegação (comportamento normal, não edição):', await page.locator('.nav-screen').isVisible());
console.log('after short click, remove buttons visible:', await page.locator('.app-icon__remove').count());
await page.locator('.back-button').click();
await page.waitForTimeout(300);

// Long press (>=600ms) should trigger edit mode.
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.waitForTimeout(750);
await page.mouse.up();
await page.waitForTimeout(150);
const removeButtons = await page.locator('.app-icon__remove').count();
console.log('after long press, remove buttons visible:', removeButtons);

await page.screenshot({ path: 'comparacoes/edit_mode.png' });

// Remove "Trabalho" (Auftrag)
const trabalhoRemove = page.locator('.app-icon', { hasText: 'Trabalho' }).locator('.app-icon__remove');
await trabalhoRemove.click();
await page.waitForTimeout(150);
console.log('Trabalho still present after remove:', await page.getByText('Trabalho', { exact: true }).count());

await page.screenshot({ path: 'comparacoes/edit_mode_after_remove.png' });

// Exit edit mode via "Concluir"
await page.getByText('Concluir', { exact: true }).click();
await page.waitForTimeout(300);
console.log('remove buttons after Concluir:', await page.locator('.app-icon__remove').count());
await page.screenshot({ path: 'comparacoes/after_done.png' });

// Reload page -> removal should persist (localStorage)
await page.reload({ waitUntil: 'networkidle' });
console.log('Trabalho present after reload (should be 0, still removed):', await page.getByText('Trabalho', { exact: true }).count());

// Re-enter edit mode and restore
const anyIcon = page.getByText('Spotify', { exact: true });
const box2 = await anyIcon.boundingBox();
await page.mouse.move(box2.x + box2.width / 2, box2.y - 60);
await page.mouse.down();
await page.waitForTimeout(750);
await page.mouse.up();
await page.waitForTimeout(150);
const restoreBtn = page.getByText(/Restaurar/);
console.log('restore button visible:', await restoreBtn.count());
await restoreBtn.click();
await page.waitForTimeout(150);
console.log('Trabalho present after restore:', await page.getByText('Trabalho', { exact: true }).count());
await page.getByText('Concluir', { exact: true }).click();

await browser.close();
