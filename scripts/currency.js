/* ============================================================
   CalcPro — currency.js
   Currency Conversion with fallback static rates + API fetch
   ============================================================ */

// Static fallback rates (base: USD)
const STATIC_RATES = {
  USD: 1,
  IDR: 16250,
  EUR: 0.921,
  GBP: 0.787,
  JPY: 154.8,
  SGD: 1.341,
  MYR: 4.72,
  AUD: 1.535,
  CNY: 7.24,
  KRW: 1342,
  SAR: 3.75,
  AED: 3.673,
  THB: 35.4,
  BTC: 0.0000155,   // approx
  ETH: 0.000315     // approx
};

let liveRates = { ...STATIC_RATES };
let ratesLoaded = false;

// Try to fetch live rates from a free public API
async function fetchLiveRates() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    if (data.result === 'success' && data.rates) {
      liveRates = { ...STATIC_RATES, ...data.rates };
      ratesLoaded = true;
      document.getElementById('rate-status').textContent = '● Live';
      document.getElementById('rate-info-bar').textContent =
        `✓ Kurs diperbarui: ${new Date(data.time_last_update_utc).toLocaleString('id-ID')} — 1 USD = Rp ${liveRates.IDR?.toLocaleString('id-ID') ?? 'N/A'}`;
    }
  } catch (e) {
    document.getElementById('rate-status').textContent = '● Offline';
    document.getElementById('rate-info-bar').textContent =
      `⚠ Menggunakan kurs statis — 1 USD ≈ Rp ${STATIC_RATES.IDR.toLocaleString('id-ID')}`;
  }
  convertCurrency();
  buildRateGrid();
}

function convertCurrency() {
  const from = document.getElementById('cur-from').value;
  const to = document.getElementById('cur-to').value;
  const amount = parseFloat(document.getElementById('cur-amount').value);

  if (isNaN(amount)) {
    document.getElementById('cur-result').textContent = '–';
    return;
  }

  const rates = liveRates;
  // Convert to USD first, then to target
  const inUSD = amount / (rates[from] || 1);
  const result = inUSD * (rates[to] || 1);

  let formatted;
  if (['IDR', 'JPY', 'KRW'].includes(to)) {
    formatted = Math.round(result).toLocaleString('id-ID');
  } else if (['BTC', 'ETH'].includes(to)) {
    formatted = result.toFixed(8);
  } else {
    formatted = result.toFixed(4);
  }

  const symbols = { USD:'$', IDR:'Rp', EUR:'€', GBP:'£', JPY:'¥', SGD:'S$', MYR:'RM', AUD:'A$', CNY:'¥', KRW:'₩', SAR:'ر.س', AED:'د.إ', THB:'฿', BTC:'₿', ETH:'Ξ' };
  document.getElementById('cur-result').textContent = (symbols[to] || '') + ' ' + formatted;
}

function swapCurrency() {
  const fromSel = document.getElementById('cur-from');
  const toSel = document.getElementById('cur-to');
  const tmp = fromSel.value;
  fromSel.value = toSel.value;
  toSel.value = tmp;
  convertCurrency();
  // Animate
  const btn = document.querySelector('#tab-currency .swap-btn');
  btn.style.transform = 'rotate(360deg)';
  setTimeout(() => btn.style.transform = '', 400);
}

function buildRateGrid() {
  const grid = document.getElementById('rate-grid');
  const base = 'IDR';
  const currencies = ['USD','EUR','GBP','JPY','SGD','MYR','AUD','CNY','SAR','AED'];
  const flags = { USD:'🇺🇸', EUR:'🇪🇺', GBP:'🇬🇧', JPY:'🇯🇵', SGD:'🇸🇬', MYR:'🇲🇾', AUD:'🇦🇺', CNY:'🇨🇳', SAR:'🇸🇦', AED:'🇦🇪' };

  grid.innerHTML = currencies.map(cur => {
    const inUSD = 1 / (liveRates[base] || 1);
    const result = inUSD * (liveRates[cur] || 1);
    const fmt = ['JPY'].includes(cur) ? result.toFixed(5) : result.toFixed(6);
    return `<div class="rate-chip">
      <div class="rate-chip-label">${flags[cur] || ''} ${cur}</div>
      <div class="rate-chip-value">1 IDR = ${fmt} ${cur}</div>
    </div>`;
  }).join('');
}

// Init currency tab
window.addEventListener('DOMContentLoaded', () => {
  buildRateGrid();
  fetchLiveRates();
});