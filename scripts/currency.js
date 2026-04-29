const STATIC_RATES = {
  USD:1, IDR:16250, EUR:0.921, GBP:0.787, JPY:154.8, SGD:1.341,
  MYR:4.72, AUD:1.535, CNY:7.24, KRW:1342, SAR:3.75, AED:3.673,
  THB:35.4, BTC:0.0000155, ETH:0.000315
};

let liveRates = { ...STATIC_RATES };
let ratesLoaded = false;

async function fetchLiveRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.result === 'success' && data.rates) {
      liveRates = { ...STATIC_RATES, ...data.rates };
      ratesLoaded = true;
      const dot = document.getElementById('rate-dot');
      const status = document.getElementById('rate-status');
      if (dot) { dot.className = 'rate-dot live'; }
      if (status) status.textContent = 'Live';
      const bar = document.getElementById('rate-info-bar');
      if (bar) bar.textContent = `✓ Kurs diperbarui: ${new Date(data.time_last_update_utc).toLocaleString('id-ID')} — 1 USD = Rp ${liveRates.IDR?.toLocaleString('id-ID') ?? 'N/A'}`;
    }
  } catch {
    const dot = document.getElementById('rate-dot');
    const status = document.getElementById('rate-status');
    if (dot) { dot.className = 'rate-dot offline'; }
    if (status) status.textContent = 'Offline';
    const bar = document.getElementById('rate-info-bar');
    if (bar) bar.textContent = `⚠ Menggunakan kurs statis — 1 USD ≈ Rp ${STATIC_RATES.IDR.toLocaleString('id-ID')}`;
  }
  convertCurrency();
  buildRateGrid();
}

function convertCurrency() {
  const from = document.getElementById('cur-from')?.value;
  const to = document.getElementById('cur-to')?.value;
  const amount = parseFloat(document.getElementById('cur-amount')?.value);
  if (!from || !to || isNaN(amount)) return;
  const inUSD = amount / (liveRates[from] || 1);
  const result = inUSD * (liveRates[to] || 1);
  let formatted;
  if (['IDR','JPY','KRW'].includes(to)) formatted = Math.round(result).toLocaleString('id-ID');
  else if (['BTC','ETH'].includes(to)) formatted = result.toFixed(8);
  else formatted = result.toFixed(4);
  const symbols = { USD:'$', IDR:'Rp', EUR:'€', GBP:'£', JPY:'¥', SGD:'S$', MYR:'RM', AUD:'A$', CNY:'¥', KRW:'₩', SAR:'ر.س', AED:'د.إ', THB:'฿', BTC:'₿', ETH:'Ξ' };
  const el = document.getElementById('cur-result');
  if (el) {
    el.textContent = (symbols[to] || '') + ' ' + formatted;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  }
}

function swapCurrency() {
  const from = document.getElementById('cur-from');
  const to = document.getElementById('cur-to');
  const tmp = from.value; from.value = to.value; to.value = tmp;
  convertCurrency();
}

function buildRateGrid() {
  const grid = document.getElementById('rate-grid');
  if (!grid) return;
  const base = 'IDR';
  const currencies = ['USD','EUR','GBP','JPY','SGD','MYR','AUD','CNY','SAR','AED'];
  const flags = { USD:'🇺🇸', EUR:'🇪🇺', GBP:'🇬🇧', JPY:'🇯🇵', SGD:'🇸🇬', MYR:'🇲🇾', AUD:'🇦🇺', CNY:'🇨🇳', SAR:'🇸🇦', AED:'🇦🇪' };
  grid.innerHTML = currencies.map(cur => {
    const inUSD = 1 / (liveRates[base] || 1);
    const result = inUSD * (liveRates[cur] || 1);
    const fmt = result < 0.001 ? result.toExponential(4) : result.toFixed(6);
    return `<div class="rate-chip">
      <div class="rate-chip-label">${flags[cur] || ''} ${cur}</div>
      <div class="rate-chip-value">1 IDR = ${fmt}</div>
    </div>`;
  }).join('');
}

window.addEventListener('DOMContentLoaded', () => {
  buildRateGrid();
  fetchLiveRates();
});
