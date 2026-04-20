/* ============================================================
   CalcPro — finance.js
   Financial Calculators: Loan, Compound Interest, ROI,
   Discount, Tax, BMI
   ============================================================ */

function setFinTab(tab, el) {
  document.querySelectorAll('.fin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.fin-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('fin-' + tab).classList.add('active');
}

function formatRupiah(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function resultRow(label, value, cls = '') {
  return `<div class="fin-result-row">
    <span class="fin-result-label">${label}</span>
    <span class="fin-result-value ${cls}">${value}</span>
  </div>`;
}

// ── Loan / KPR Calculator ───────────────────────────────────
function calcLoan() {
  const P = parseFloat(document.getElementById('loan-amount').value);
  const r = parseFloat(document.getElementById('loan-rate').value) / 100 / 12;
  const n = parseInt(document.getElementById('loan-term').value);

  if (isNaN(P) || isNaN(r) || isNaN(n) || r <= 0 || n <= 0) {
    showFinResult('loan-result', '<div class="fin-result-row"><span class="fin-result-label">⚠ Input tidak valid</span></div>');
    return;
  }

  // Annuity formula
  const monthly = P * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1);
  const totalPay = monthly * n;
  const totalInterest = totalPay - P;

  // Build amortization preview (first 3 + last 1)
  let amort = '';
  let remaining = P;
  const rows = [];
  for (let i = 1; i <= n; i++) {
    const interest = remaining * r;
    const principal = monthly - interest;
    remaining -= principal;
    rows.push({ i, interest, principal, remaining: Math.max(0, remaining) });
  }

  const preview = [rows[0], rows[Math.floor(n/4)], rows[Math.floor(n/2)], rows[n-1]];
  amort = `
    <div class="fin-result-row" style="font-weight:600; font-size:11px; color:var(--text-secondary); text-transform:uppercase; letter-spacing:.06em">
      <span>Bulan</span><span>Angsuran</span><span>Bunga</span><span>Sisa Pokok</span>
    </div>
    ${preview.map(r => `
      <div class="fin-result-row" style="font-size:12px">
        <span class="fin-result-label">${r.i}</span>
        <span class="fin-result-value" style="font-size:12px">${formatRupiah(monthly)}</span>
        <span class="fin-result-value" style="font-size:12px; color:var(--danger)">${formatRupiah(r.interest)}</span>
        <span class="fin-result-value" style="font-size:12px">${formatRupiah(r.remaining)}</span>
      </div>
    `).join('')}
  `;

  const html = `
    ${resultRow('Angsuran per Bulan', formatRupiah(monthly), 'highlight')}
    ${resultRow('Total Pinjaman', formatRupiah(P))}
    ${resultRow('Total Pembayaran', formatRupiah(totalPay))}
    ${resultRow('Total Bunga', formatRupiah(totalInterest), 'danger')}
    ${resultRow('Suku Bunga / Bulan', (parseFloat(document.getElementById('loan-rate').value)/12).toFixed(4) + '%')}
    <div style="margin-top:12px; font-size:12px; color:var(--text-secondary); font-weight:600; letter-spacing:.05em; text-transform:uppercase; margin-bottom:4px">Amortisasi (Sampel)</div>
    ${amort}
  `;
  showFinResult('loan-result', html);
}

// ── Compound Interest ───────────────────────────────────────
function calcCompound() {
  const P = parseFloat(document.getElementById('ci-principal').value);
  const r = parseFloat(document.getElementById('ci-rate').value) / 100;
  const t = parseFloat(document.getElementById('ci-years').value);
  const n = parseInt(document.getElementById('ci-freq').value);
  const pmt = parseFloat(document.getElementById('ci-deposit').value) || 0;

  if (isNaN(P) || isNaN(r) || isNaN(t)) return;

  // FV = P(1 + r/n)^(nt) + PMT × [((1+r/n)^(nt)-1)/(r/n)]
  const nt = n * t;
  const rate = r / n;
  const fvPrincipal = P * Math.pow(1 + rate, nt);
  const fvDeposits = pmt > 0 ? pmt * ((Math.pow(1+rate, nt) - 1) / rate) : 0;
  const fv = fvPrincipal + fvDeposits;
  const totalDeposits = P + (pmt * nt);
  const totalInterest = fv - totalDeposits;

  // Year-by-year table (up to 10 years shown)
  let tbl = '';
  const showYears = Math.min(t, 10);
  for (let y = 1; y <= showYears; y++) {
    const ynt = n * y;
    const yFV = P * Math.pow(1+rate, ynt) + (pmt > 0 ? pmt * ((Math.pow(1+rate,ynt)-1)/rate) : 0);
    tbl += `<div class="fin-result-row" style="font-size:12px">
      <span class="fin-result-label">Tahun ${y}</span>
      <span class="fin-result-value" style="font-size:12px">${formatRupiah(yFV)}</span>
    </div>`;
  }

  const html = `
    ${resultRow('Modal Awal', formatRupiah(P))}
    ${resultRow('Total Setoran', formatRupiah(pmt * nt))}
    ${resultRow('Total Bunga', formatRupiah(totalInterest), 'highlight')}
    ${resultRow('Nilai Akhir Investasi', formatRupiah(fv), 'highlight')}
    ${resultRow('Pertumbuhan', ((fv/P - 1)*100).toFixed(2) + '%')}
    <div style="margin-top:12px; font-size:12px; color:var(--text-secondary); font-weight:600; letter-spacing:.05em; text-transform:uppercase; margin-bottom:4px">Pertumbuhan per Tahun</div>
    ${tbl}
  `;
  showFinResult('compound-result', html);
}

// ── ROI ─────────────────────────────────────────────────────
function calcROI() {
  const initial = parseFloat(document.getElementById('roi-initial').value);
  const final = parseFloat(document.getElementById('roi-final').value);
  const years = parseFloat(document.getElementById('roi-years').value);

  const gain = final - initial;
  const roi = (gain / initial) * 100;
  const annualROI = (Math.pow(final/initial, 1/years) - 1) * 100;
  const isGain = gain >= 0;

  const html = `
    ${resultRow('Modal Awal', formatRupiah(initial))}
    ${resultRow('Nilai Akhir', formatRupiah(final))}
    ${resultRow('Keuntungan / Kerugian', formatRupiah(gain), isGain ? 'highlight' : 'danger')}
    ${resultRow('ROI Total', roi.toFixed(2) + '%', isGain ? 'highlight' : 'danger')}
    ${resultRow('ROI per Tahun (CAGR)', annualROI.toFixed(2) + '%')}
    ${resultRow('Durasi', years + ' tahun')}
    ${resultRow('Faktor Pengganda', (final/initial).toFixed(4) + 'x')}
  `;
  showFinResult('roi-result', html);
}

// ── Discount ────────────────────────────────────────────────
function calcDiscount() {
  const original = parseFloat(document.getElementById('disc-original').value);
  const pct = parseFloat(document.getElementById('disc-percent').value);
  const discount = original * pct / 100;
  const final = original - discount;

  const html = `
    ${resultRow('Harga Asli', formatRupiah(original))}
    ${resultRow('Diskon (' + pct + '%)', formatRupiah(discount), 'danger')}
    ${resultRow('Harga Setelah Diskon', formatRupiah(final), 'highlight')}
    ${resultRow('Hemat', formatRupiah(discount))}
  `;
  showFinResult('discount-result', html);
}

// ── Tax PPN ─────────────────────────────────────────────────
function calcTax() {
  const before = parseFloat(document.getElementById('tax-before').value);
  const rate = parseFloat(document.getElementById('tax-rate').value);
  const tax = before * rate / 100;
  const after = before + tax;

  const html = `
    ${resultRow('Harga Sebelum Pajak', formatRupiah(before))}
    ${resultRow(`PPN (${rate}%)`, formatRupiah(tax), 'danger')}
    ${resultRow('Harga Setelah Pajak', formatRupiah(after), 'highlight')}
    ${resultRow('Persentase Pajak', rate + '%')}
  `;
  showFinResult('tax-result', html);
}

// ── BMI ─────────────────────────────────────────────────────
function calcBMI() {
  const weight = parseFloat(document.getElementById('bmi-weight').value);
  const heightCm = parseFloat(document.getElementById('bmi-height').value);
  const age = parseInt(document.getElementById('bmi-age').value);
  const gender = document.getElementById('bmi-gender').value;

  const h = heightCm / 100;
  const bmi = weight / (h * h);

  let category, color, desc;
  if (bmi < 16)       { category = 'Sangat Kurus (Starvation)'; color = 'danger'; }
  else if (bmi < 17)  { category = 'Kurus Berat (Severe)'; color = 'danger'; }
  else if (bmi < 18.5){ category = 'Kurus'; color = 'danger'; }
  else if (bmi < 23)  { category = '✓ Normal'; color = 'highlight'; }
  else if (bmi < 25)  { category = 'Berat Badan Lebih (Overweight)'; color = ''; }
  else if (bmi < 30)  { category = 'Obesitas Kelas I'; color = 'danger'; }
  else if (bmi < 35)  { category = 'Obesitas Kelas II'; color = 'danger'; }
  else                { category = 'Obesitas Kelas III (Morbid)'; color = 'danger'; }

  // Ideal weight range (BMI 18.5–23)
  const idealMin = 18.5 * h * h;
  const idealMax = 23 * h * h;

  // BMR (Basal Metabolic Rate) - Mifflin-St Jeor
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * heightCm - 5 * age - 161;
  }

  const html = `
    ${resultRow('BMI', bmi.toFixed(2), color)}
    ${resultRow('Kategori', category, color)}
    ${resultRow('Berat Badan', weight + ' kg')}
    ${resultRow('Tinggi Badan', heightCm + ' cm')}
    ${resultRow('Berat Ideal (BMI 18.5–23)', `${idealMin.toFixed(1)} – ${idealMax.toFixed(1)} kg`)}
    ${resultRow('BMR (Kalori Basal/hari)', Math.round(bmr) + ' kkal')}
    ${resultRow('Kalori Aktif Sedang', Math.round(bmr * 1.55) + ' kkal/hari')}
  `;
  showFinResult('bmi-result', html);
}

function showFinResult(id, html) {
  const el = document.getElementById(id);
  el.innerHTML = html;
  el.classList.add('show');
}