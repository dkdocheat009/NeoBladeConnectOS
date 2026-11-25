import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:5174/';

async function captureAt(hour, minute, outPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.addInitScript(
    ({ h, m }) => {
      const fixed = new Date();
      fixed.setHours(h, m, 0, 0);
      const RealDate = Date;
      // eslint-disable-next-line no-global-assign
      Date = class extends RealDate {
        constructor(...args) {
          if (args.length === 0) super(fixed.getTime());
          else super(...args);
        }
        static now() {
          return fixed.getTime();
        }
      };
    },
    { h: hour, m: minute },
  );
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 115, height: 140 } });

  const rects = {};
  rects.clockBox = await page.locator('.status-bar__clock').boundingBox();
  rects.barsBox = await page.locator('.status-bar__bars').boundingBox();
  rects.networkBox = await page.locator('.status-bar__network').boundingBox();
  rects.batteryBox = await page.locator('.status-bar__battery').boundingBox();
  await browser.close();
  return rects;
}

const r1 = await captureAt(9, 9, 'comparacoes/statusbar_0909.png');
const r2 = await captureAt(17, 59, 'comparacoes/statusbar_1759.png');

console.log('--- 09:09 ---');
console.log(JSON.stringify(r1, null, 2));
console.log('--- 17:59 ---');
console.log(JSON.stringify(r2, null, 2));
console.log('clock.x equal:', r1.clockBox.x === r2.clockBox.x);
console.log('bars.x equal:', r1.barsBox.x === r2.barsBox.x);
console.log('battery.x equal:', r1.batteryBox.x === r2.batteryBox.x);
