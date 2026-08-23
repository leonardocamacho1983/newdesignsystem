import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage();
const falhas = [];
p.on('requestfailed', r => falhas.push(`${r.failure()?.errorText} ${r.url().slice(0,70)}`));
p.on('response', r => { if (r.url().includes('fonts.g')) falhas.push(`HTTP ${r.status()} ${r.url().slice(0,70)}`); });
await p.goto('http://localhost:8899/_tipo.html', { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(1500);
console.log('=== requisições de fonte ===');
console.log(falhas.length ? falhas.join('\n') : '(nenhuma)');
console.log('\n=== o navegador considera cada família disponível? ===');
console.log(await p.evaluate(() => ['Inter Tight','Source Serif 4','Literata','IBM Plex Mono','JetBrains Mono']
  .map(f => `${f.padEnd(16)} ${document.fonts.check(`16px "${f}"`)}`).join('\n')));
await b.close();
