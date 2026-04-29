function setZakatTab(tab, el) {
  document.querySelectorAll('.zakat-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.zakat-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('zakat-' + tab).classList.add('active');
}

function zakatResultRow(label, value, cls = '') {
  return `<div class="fin-result-row">
    <span class="fin-result-label">${label}</span>
    <span class="fin-result-value ${cls}">${value}</span>
  </div>`;
}

function fmtRp(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function calcZakatMaal() {
  const goldPrice = parseFloat(document.getElementById('z-gold-price').value) || 1050000;
  const wealth = parseFloat(document.getElementById('z-wealth').value);
  if (isNaN(wealth)) return;
  const nisab = 85 * goldPrice;
  const isWajib = wealth >= nisab;
  const zakatAmount = isWajib ? wealth * 0.025 : 0;
  const box = document.getElementById('zakat-maal-result');
  box.innerHTML = `
    ${zakatResultRow('Nisab (85g Emas)', fmtRp(nisab))}
    ${zakatResultRow('Total Harta', fmtRp(wealth))}
    ${zakatResultRow('Status', isWajib ? '✅ Wajib Zakat' : '❌ Belum Wajib Zakat', isWajib ? 'highlight' : 'danger')}
    ${isWajib ? zakatResultRow('Zakat yang Harus Dibayar (2.5%)', fmtRp(zakatAmount), 'highlight') : ''}
    ${isWajib ? zakatResultRow('Sisa Harta Setelah Zakat', fmtRp(wealth - zakatAmount)) : ''}
  `;
  box.classList.add('show');
}

function calcZakatIncome() {
  const income = parseFloat(document.getElementById('z-income').value);
  const ricePrice = parseFloat(document.getElementById('z-rice').value) || 14000;
  if (isNaN(income)) return;
  const nisab = 653 * ricePrice;
  const isWajib = income >= nisab;
  const zakatAmount = isWajib ? income * 0.025 : 0;
  const box = document.getElementById('zakat-income-result');
  box.innerHTML = `
    ${zakatResultRow('Nisab (653 kg Beras)', fmtRp(nisab))}
    ${zakatResultRow('Penghasilan Bulanan', fmtRp(income))}
    ${zakatResultRow('Status', isWajib ? '✅ Wajib Zakat' : '❌ Belum Wajib Zakat', isWajib ? 'highlight' : 'danger')}
    ${isWajib ? zakatResultRow('Zakat Bulanan (2.5%)', fmtRp(zakatAmount), 'highlight') : ''}
    ${isWajib ? zakatResultRow('Zakat Tahunan', fmtRp(zakatAmount * 12), 'highlight') : ''}
  `;
  box.classList.add('show');
}

function calcZakatFitrah() {
  const people = parseInt(document.getElementById('z-people').value) || 1;
  const ricePrice = parseFloat(document.getElementById('z-rice2').value) || 14000;
  const ricePerPerson = 2.7;
  const zakatPerPerson = ricePerPerson * ricePrice;
  const totalZakat = zakatPerPerson * people;
  const box = document.getElementById('zakat-fitrah-result');
  box.innerHTML = `
    ${zakatResultRow('Beras per Orang', ricePerPerson + ' kg')}
    ${zakatResultRow('Jumlah Jiwa', people + ' orang')}
    ${zakatResultRow('Zakat per Orang', fmtRp(zakatPerPerson))}
    ${zakatResultRow('Total Zakat Fitrah', fmtRp(totalZakat), 'highlight')}
    ${zakatResultRow('Setara Beras', (ricePerPerson * people).toFixed(1) + ' kg')}
  `;
  box.classList.add('show');
}
