const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/stocks.json'), 'utf8'));

function confStyle(val) {
  if (val == null) return '';
  if (val < 40)  return 'color:#f87171;font-weight:500';
  if (val <= 60) return 'color:#fbbf24;font-weight:500';
  return 'color:#4ade80;font-weight:500';
}

function cell(ai, ticker) {
  const p = data.predictions[ai]?.[ticker];
  if (!p || p.er1 == null) return `<td class="ph">—</td>`;
  const cs = confStyle(p.confidence);
  return `<td>${p.er1} <span class="sep">\\</span> ${p.er2} <span class="sep">\\</span> ${p.combined} <span class="sep">\\</span> <span style="${cs}">${p.confidence}%</span></td>`;
}

function avgCell(ticker) {
  const filled = data.meta.aiChats
    .map(ai => data.predictions[ai]?.[ticker])
    .filter(p => p && p.confidence != null);
  if (filled.length === 0) return `<td class="ph">—</td>`;
  const avgCon = Math.round(filled.reduce((s, p) => s + p.confidence, 0) / filled.length);
  const cs = confStyle(avgCon);
  const sample = filled[0];
  return `<td>${sample.er1} <span class="sep">\\</span> ${sample.er2} <span class="sep">\\</span> ${sample.combined} <span class="sep">\\</span> <span style="${cs}">${avgCon}%</span></td>`;
}

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m)-1]} ${parseInt(day)}, ${y}`;
}

const minWidth = data.stocks.length * 200 + 100;

const tableHeaders = data.stocks.map(s =>
  `<th>${s.ticker}<span class="th-sub">ER1\\ER2\\Comb\\Con</span></th>`
).join('\n            ');

const aiRows = data.meta.aiChats.map(ai => {
  const cells = data.stocks.map(s => cell(ai, s.ticker)).join('\n            ');
  return `          <tr>
            <td class="ai-name">${ai}</td>
            ${cells}
          </tr>`;
}).join('\n');

const avgRow = `          <tr class="avg-row">
            <td class="ai-name">Average</td>
            ${data.stocks.map(s => avgCell(s.ticker)).join('\n            ')}
          </tr>`;

const dateCards = data.stocks.map(s => `
      <div class="date-card">
        <div class="date-ticker">${s.ticker}</div>
        <div class="date-name">${s.name}</div>
        <div class="date-rows">
          <div class="date-row"><span class="date-label">ER1</span><span class="date-value">${formatDate(s.er1)}</span></div>
          <div class="date-row"><span class="date-label">ER2</span><span class="date-value">${formatDate(s.er2)}</span></div>
        </div>
      </div>`).join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Stock Predictions Table</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  :root{--bg:#0a0a0f;--bg2:#111118;--bg3:#1a1a24;--border:rgba(255,255,255,0.07);--border2:rgba(255,255,255,0.12);--text:#e8e8f0;--text2:#9090a8;--text3:#5a5a70;--accent:#7c6aff}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'DM Mono',monospace;background:var(--bg);color:var(--text);min-height:100vh}
  body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(rgba(124,106,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(124,106,255,0.03) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0}
  .glow-orb{position:fixed;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(124,106,255,0.08) 0%,transparent 70%);top:-200px;right:-200px;pointer-events:none;z-index:0;animation:pulse 8s ease-in-out infinite}
  @keyframes pulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.1);opacity:1}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .container{position:relative;z-index:1;padding:48px 32px}
  header{margin-bottom:48px;animation:fadeUp .6s ease both}
  .header-top{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:24px}
  h1{font-family:'Syne',sans-serif;font-size:clamp(28px,4vw,48px);font-weight:800;letter-spacing:-.03em;background:linear-gradient(135deg,#e8e8f0 0%,#7c6aff 60%,#a855f7 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1.1}
  .subtitle{font-size:13px;color:var(--text3);margin-top:8px;letter-spacing:.05em;text-transform:uppercase}
  .badges{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .badge{font-size:11px;padding:5px 12px;border-radius:20px;border:1px solid;letter-spacing:.04em}
  .badge-ai{border-color:rgba(124,106,255,.4);color:#a099ff;background:rgba(124,106,255,.08)}
  .badge-stocks{border-color:rgba(74,222,128,.3);color:#6ee7a0;background:rgba(74,222,128,.06)}
  .badge-updated{border-color:var(--border2);color:var(--text3);background:var(--bg3)}
  .legend{display:flex;gap:20px;flex-wrap:wrap;padding:14px 20px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;animation:fadeUp .6s .1s ease both}
  .legend-item{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text2)}
  .legend-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
  .table-section{animation:fadeUp .6s .2s ease both;margin-bottom:32px}
  .section-label{font-family:'Syne',sans-serif;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);margin-bottom:12px}
  .table-wrap{overflow-x:auto;border:1px solid var(--border2);border-radius:12px;background:var(--bg2)}
  .table-wrap::-webkit-scrollbar{height:6px}
  .table-wrap::-webkit-scrollbar-track{background:var(--bg3)}
  .table-wrap::-webkit-scrollbar-thumb{background:var(--accent);border-radius:3px}
  table{width:100%;border-collapse:collapse;min-width:${minWidth}px;font-size:10.5px}
  th{background:var(--bg3);padding:10px 8px;text-align:center;border-bottom:1px solid var(--border2);border-right:1px solid var(--border);font-family:'Syne',sans-serif;font-size:11px;font-weight:700;color:var(--text2);letter-spacing:.05em;white-space:nowrap;position:sticky;top:0;z-index:2}
  th.ai-col-h{text-align:left;width:90px;position:sticky;left:0;z-index:3;background:var(--bg3)}
  th:last-child{border-right:none}
  .th-sub{display:block;font-family:'DM Mono',monospace;font-size:9px;font-weight:400;color:var(--text3);margin-top:3px}
  td{padding:9px 8px;border-bottom:1px solid var(--border);border-right:1px solid var(--border);text-align:center;line-height:1.5;color:var(--text);white-space:nowrap}
  td.ai-name{text-align:left;font-family:'Syne',sans-serif;font-weight:600;font-size:12px;width:90px;position:sticky;left:0;background:var(--bg2);z-index:1;border-right:1px solid var(--border2)}
  td:last-child{border-right:none}
  tr:last-child td{border-bottom:none}
  tr:hover td:not(.ai-name){background:rgba(124,106,255,.04)}
  tr:hover td.ai-name{background:var(--bg3)}
  .avg-row td{background:var(--bg3)!important;font-weight:500;border-top:1px solid var(--border2)}
  .avg-row td.ai-name{background:var(--bg3)!important;color:var(--accent)}
  .ph{color:var(--text3);font-style:italic}
  .sep{color:var(--text3);margin:0 2px}
  .manual{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px 20px;font-size:12px;color:var(--text2);line-height:1.8;animation:fadeUp .6s .3s ease both;margin-bottom:32px}
  .manual strong{color:var(--text);font-weight:500}
  .earnings-section{animation:fadeUp .6s .4s ease both;margin-bottom:32px}
  .dates-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
  .date-card{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px 16px;transition:border-color .2s,background .2s}
  .date-card:hover{border-color:rgba(124,106,255,.3);background:var(--bg3)}
  .date-ticker{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--accent);margin-bottom:4px}
  .date-name{font-size:10px;color:var(--text3);margin-bottom:6px}
  .date-rows{display:flex;flex-direction:column;gap:3px}
  .date-row{display:flex;justify-content:space-between;align-items:center;font-size:11px}
  .date-label{color:var(--text3)}
  .date-value{color:var(--text2);font-weight:500}
  footer{text-align:center;padding:32px 0 16px;color:var(--text3);font-size:11px;letter-spacing:.04em;border-top:1px solid var(--border)}
  footer span{color:var(--accent)}
</style>
</head>
<body>
<div class="glow-orb"></div>
<div class="container">
  <header>
    <div class="header-top">
      <div>
        <h1>AI Stock Predictions</h1>
        <p class="subtitle">Next 2 earnings reports · Multi-AI consensus table</p>
      </div>
      <div class="badges">
        <span class="badge badge-ai">${data.meta.aiChats.length} AI models</span>
        <span class="badge badge-stocks">${data.stocks.length} stocks</span>
        <span class="badge badge-updated">Updated ${data.meta.lastUpdated}</span>
      </div>
    </div>
    <div class="legend">
      <div class="legend-item"><span class="legend-dot" style="background:#f87171"></span><span style="color:#f87171">Red</span>&nbsp;— below 40% confidence</div>
      <div class="legend-item"><span class="legend-dot" style="background:#fbbf24"></span><span style="color:#fbbf24">Yellow</span>&nbsp;— 40–60% confidence</div>
      <div class="legend-item"><span class="legend-dot" style="background:#4ade80"></span><span style="color:#4ade80">Green</span>&nbsp;— above 60% confidence</div>
    </div>
  </header>

  <div class="table-section">
    <div class="section-label">Predictions table</div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="ai-col-h">AI Chat</th>
            ${tableHeaders}
          </tr>
        </thead>
        <tbody>
${aiRows}
${avgRow}
        </tbody>
      </table>
    </div>
  </div>

  <div class="manual">
    <strong>Reader manual</strong> — numbers are:
    <strong>predicted % movement by 1st earnings report</strong> \\
    <strong>predicted % movement by 2nd earnings report</strong> \\
    <strong>combined movement of both</strong> \\
    <strong>confidence the prediction is correct (±3% margin)</strong>
  </div>

  <div class="earnings-section">
    <div class="section-label">Earnings dates</div>
    <div class="dates-grid">${dateCards}</div>
  </div>

  <footer>Built with <span>Claude</span> · AI predictions for informational purposes only · Not financial advice · Last updated: ${data.meta.lastUpdated}</footer>
</div>
</body>
</html>`;

const outPath = path.join(__dirname, '../index.html');
fs.writeFileSync(outPath, html);
console.log(`✅ index.html generated — ${data.stocks.length} stocks, ${data.meta.aiChats.length} AI models`);
