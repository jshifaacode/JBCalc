function setFinTab(tab, el) {
  document.querySelectorAll('.fin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.fin-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('fin-' + tab).classList.add('active');
}

function fmtRupiah(n) { return 'Rp ' + Math.round(n).toLocaleString('id-ID'); }

function finRow(label, value, cls = '') {
  return `<div class="fin-result-row"><span class="fin-result-label">${label}</span><span class="fin-result-value ${cls}">${value}</span></div>`;
}

function showFinResult(id, html) {
  const el = document.getElementById(id);
  el.innerHTML = html; el.classList.add('show');
}

function calcLoan() {
  const P = parseFloat(document.getElementById('loan-amount').value);
  const r = parseFloat(document.getElementById('loan-rate').value) / 100 / 12;
  const n = parseInt(document.getElementById('loan-term').value);
  if (isNaN(P) || isNaN(r) || isNaN(n) || r <= 0 || n <= 0) return;
  const monthly = P * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1);
  const totalPay = monthly * n;
  const totalInterest = totalPay - P;
  const rows = [];
  let remaining = P;
  for (let i = 1; i <= n; i++) {
    const interest = remaining * r;
    const principal = monthly - interest;
    remaining -= principal;
    rows.push({ i, interest, principal, remaining: Math.max(0, remaining) });
  }
  const preview = [rows[0], rows[Math.floor(n/4)], rows[Math.floor(n/2)], rows[n-1]].filter(Boolean);
  const amortHtml = `
    <div class="fin-result-row" style="font-size:11px;font-weight:700;color:var(--text-3);letter-spacing:.06em;text-transform:uppercase">
      <span>${t('r_month')}</span><span>${t('r_interest')}</span><span>${t('r_principal')}</span><span>${t('r_remaining')}</span>
    </div>
    ${preview.map(row => `<div class="fin-result-row" style="font-size:12px">
      <span class="fin-result-label">${row.i}</span>
      <span class="fin-result-value" style="font-size:12px;color:var(--danger)">${fmtRupiah(row.interest)}</span>
      <span class="fin-result-value" style="font-size:12px">${fmtRupiah(row.principal)}</span>
      <span class="fin-result-value" style="font-size:12px">${fmtRupiah(row.remaining)}</span>
    </div>`).join('')}`;
  showFinResult('loan-result', `
    ${finRow(t('r_monthly_payment'), fmtRupiah(monthly), 'highlight')}
    ${finRow(t('r_loan_amount'), fmtRupiah(P))}
    ${finRow(t('r_total_payment'), fmtRupiah(totalPay))}
    ${finRow(t('r_total_interest'), fmtRupiah(totalInterest), 'danger')}
    ${finRow(t('r_interest_ratio'), ((totalInterest/P)*100).toFixed(2)+'%')}
    <div style="margin-top:12px;font-size:11px;color:var(--text-3);font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px">${t('r_amort_sample')}</div>
    ${amortHtml}
  `);
}

function calcCompound() {
  const P = parseFloat(document.getElementById('ci-principal').value);
  const r = parseFloat(document.getElementById('ci-rate').value) / 100;
  const years = parseFloat(document.getElementById('ci-years').value);
  const n = parseInt(document.getElementById('ci-freq').value);
  const pmt = parseFloat(document.getElementById('ci-deposit').value) || 0;
  if (isNaN(P) || isNaN(r) || isNaN(years)) return;
  const nt = n * years;
  const rate = r / n;
  const fvP = P * Math.pow(1 + rate, nt);
  const fvD = pmt > 0 ? pmt * ((Math.pow(1+rate, nt) - 1) / rate) : 0;
  const fv = fvP + fvD;
  const totalDeposits = P + (pmt * nt);
  const totalInterest = fv - totalDeposits;
  let tbl = '';
  const showY = Math.min(years, 12);
  for (let y = 1; y <= showY; y++) {
    const ynt = n * y;
    const yFV = P * Math.pow(1+rate, ynt) + (pmt > 0 ? pmt * ((Math.pow(1+rate,ynt)-1)/rate) : 0);
    tbl += `<div class="fin-result-row" style="font-size:12px">
      <span class="fin-result-label">${t('r_year')} ${y}</span>
      <span class="fin-result-value" style="font-size:12px">${fmtRupiah(yFV)}</span>
    </div>`;
  }
  showFinResult('compound-result', `
    ${finRow(t('r_principal'), fmtRupiah(P))}
    ${finRow(t('r_total_deposit'), fmtRupiah(pmt * nt))}
    ${finRow(t('r_total_interest'), fmtRupiah(totalInterest), 'highlight')}
    ${finRow(t('r_final_value'), fmtRupiah(fv), 'highlight')}
    ${finRow(t('r_growth'), ((fv/P - 1)*100).toFixed(2) + '%')}
    <div style="margin-top:12px;font-size:11px;color:var(--text-3);font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px">${t('r_growth_per_year')}</div>
    ${tbl}
  `);
}

function calcROI() {
  const initial = parseFloat(document.getElementById('roi-initial').value);
  const final = parseFloat(document.getElementById('roi-final').value);
  const years = parseFloat(document.getElementById('roi-years').value);
  const gain = final - initial;
  const roi = (gain / initial) * 100;
  const annualROI = (Math.pow(final/initial, 1/years) - 1) * 100;
  const isGain = gain >= 0;
  showFinResult('roi-result', `
    ${finRow(t('r_principal'), fmtRupiah(initial))}
    ${finRow(t('r_final_value'), fmtRupiah(final))}
    ${finRow(t('r_profit_loss'), fmtRupiah(gain), isGain ? 'highlight' : 'danger')}
    ${finRow(t('r_roi_total'), roi.toFixed(2) + '%', isGain ? 'highlight' : 'danger')}
    ${finRow(t('r_roi_annual'), annualROI.toFixed(2) + '%')}
    ${finRow(t('r_multiplier'), (final/initial).toFixed(4) + 'x')}
    ${finRow(t('r_duration'), years + ' ' + t('r_years'))}
  `);
}

function calcDiscount() {
  const orig = parseFloat(document.getElementById('disc-original').value);
  const pct = parseFloat(document.getElementById('disc-percent').value);
  const discount = orig * pct / 100;
  const final = orig - discount;
  showFinResult('discount-result', `
    ${finRow(t('r_orig_price'), fmtRupiah(orig))}
    ${finRow(t('r_discount') + ' (' + pct + '%)', fmtRupiah(discount), 'danger')}
    ${finRow(t('r_final_price'), fmtRupiah(final), 'highlight')}
    ${finRow(t('r_save'), fmtRupiah(discount))}
  `);
}

function calcTax() {
  const before = parseFloat(document.getElementById('tax-before').value);
  const rate = parseFloat(document.getElementById('tax-rate').value);
  const tax = before * rate / 100;
  const after = before + tax;
  showFinResult('tax-result', `
    ${finRow(t('r_price_before_tax'), fmtRupiah(before))}
    ${finRow('PPN (' + rate + '%)', fmtRupiah(tax), 'danger')}
    ${finRow(t('r_price_after_tax'), fmtRupiah(after), 'highlight')}
    ${finRow(t('r_tax_rate'), rate + '%')}
  `);
}

function calcBMI() {
  const weight = parseFloat(document.getElementById('bmi-weight').value);
  const heightCm = parseFloat(document.getElementById('bmi-height').value);
  const age = parseInt(document.getElementById('bmi-age').value);
  const gender = document.getElementById('bmi-gender').value;
  const h = heightCm / 100;
  const bmi = weight / (h * h);
  let catKey, color;
  if (bmi < 16)        { catKey = 'bmi_severe_thin'; color = 'danger'; }
  else if (bmi < 17)   { catKey = 'bmi_very_thin';   color = 'danger'; }
  else if (bmi < 18.5) { catKey = 'bmi_thin';        color = 'danger'; }
  else if (bmi < 23)   { catKey = 'bmi_normal';      color = 'highlight'; }
  else if (bmi < 25)   { catKey = 'bmi_overweight';  color = ''; }
  else if (bmi < 30)   { catKey = 'bmi_obese1';      color = 'danger'; }
  else if (bmi < 35)   { catKey = 'bmi_obese2';      color = 'danger'; }
  else                 { catKey = 'bmi_obese3';       color = 'danger'; }
  const category = (bmi >= 18.5 && bmi < 23 ? '✓ ' : '') + t(catKey);
  const idealMin = 18.5 * h * h;
  const idealMax = 23 * h * h;
  let bmr;
  if (gender === 'male') bmr = 10 * weight + 6.25 * heightCm - 5 * age + 5;
  else bmr = 10 * weight + 6.25 * heightCm - 5 * age - 161;
  showFinResult('bmi-result', `
    ${finRow('BMI', bmi.toFixed(2), color)}
    ${finRow(t('r_category'), category, color)}
    ${finRow(t('r_body_weight'), weight + ' kg')}
    ${finRow(t('r_body_height'), heightCm + ' cm')}
    ${finRow(t('r_ideal_weight'), idealMin.toFixed(1) + ' – ' + idealMax.toFixed(1) + ' kg')}
    ${finRow(t('r_bmr'), Math.round(bmr) + ' kcal')}
    ${finRow(t('r_active_medium'), Math.round(bmr * 1.55) + ' kcal/' + t('r_day'))}
    ${finRow(t('r_active_high'), Math.round(bmr * 1.725) + ' kcal/' + t('r_day'))}
  `);
}
