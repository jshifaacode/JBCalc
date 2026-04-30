let stdState = {
  current: '0', prev: '', operator: null,
  shouldReset: false, expr: '', memory: 0
};

let sciState = {
  current: '0', prev: '', operator: null,
  shouldReset: false, expr: '', angleMode: 'DEG', is2nd: false
};

let currentTheme = 'dark';
let historyData = [];

function switchTab(name, el) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  el.classList.add('active');
  const topbarEl = document.getElementById('topbarTitle');
  if (topbarEl) {
    const titleKey = 'topbar_' + name;
    const translated = t(titleKey);
    topbarEl.textContent = (translated && translated !== titleKey) ? translated : (el.querySelector('span:not(.nav-icon-wrap):not(.nav-badge)')?.textContent || '');
  }
  if (window.innerWidth <= 900) closeSidebar();
}

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  sb.classList.contains('open') ? closeSidebar() : openSidebar();
}

function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  const ov = document.getElementById('sidebarOverlay');
  ov.style.display = 'block';
  requestAnimationFrame(() => ov.classList.add('show'));
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  const ov = document.getElementById('sidebarOverlay');
  ov.classList.remove('show');
  setTimeout(() => { ov.style.display = 'none'; }, 300);
  document.body.style.overflow = '';
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  const btn = document.getElementById('themeBtn');
  const topBtn = document.getElementById('topbarTheme');
  if (currentTheme === 'light') {
    btn.classList.add('active');
    if (topBtn) topBtn.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    btn.classList.remove('active');
    if (topBtn) topBtn.innerHTML = '<i class="fas fa-moon"></i>';
  }
  showToast(t(currentTheme === 'light' ? 'toast_light' : 'toast_dark'));
}

function showToast(msg, type = '') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast' + (type ? ' ' + type : '');
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

function toggleHistoryPanel() {
  const panel = document.getElementById('historyPanel');
  const backdrop = document.getElementById('historyBackdrop');
  const isOpen = panel.classList.contains('open');
  if (isOpen) {
    panel.classList.remove('open');
    backdrop.classList.remove('show');
  } else {
    renderHistoryList();
    panel.classList.add('open');
    backdrop.classList.add('show');
  }
}

function addHistory(expr, result) {
  historyData.unshift({ expr, result, time: new Date().toLocaleTimeString() });
  if (historyData.length > 100) historyData.pop();
}

function renderHistoryList() {
  const list = document.getElementById('historyList');
  if (historyData.length === 0) {
    list.innerHTML = '<div class="history-empty">' + t('history_empty') + '</div>';
    return;
  }
  list.innerHTML = historyData.map(function(h, i) {
    return '<div class="history-item">' +
      '<div class="history-item-main" onclick="useHistory(' + i + ')">' +
      '<div class="history-item-expr">' + h.expr + '</div>' +
      '<div class="history-item-result">' + h.result + '</div>' +
      '<div class="history-item-time">' + h.time + '</div>' +
      '</div>' +
      '<button class="history-item-del" onclick="deleteHistory(' + i + ')"><i class="fas fa-trash-alt"></i></button>' +
      '</div>';
  }).join('');
}

function deleteHistory(i) {
  historyData.splice(i, 1);
  renderHistoryList();
}

function useHistory(i) {
  const h = historyData[i];
  const activeTab = document.querySelector('.tab-panel.active').id;
  if (activeTab === 'tab-standard') {
    stdState.current = h.result.replace(/[^0-9.\-]/g, '') || '0';
    updateStdDisplay();
  } else if (activeTab === 'tab-scientific') {
    sciState.current = h.result.replace(/[^0-9.\-]/g, '') || '0';
    updateSciDisplay();
  }
  toggleHistoryPanel();
}

function clearHistory() {
  historyData = [];
  renderHistoryList();
  showToast(t('toast_history_clear'));
}

document.addEventListener('click', e => {
  const key = e.target.closest('.key');
  if (!key) return;
  const rect = key.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;`;
  key.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
  if (navigator.vibrate) navigator.vibrate(8);
});

document.addEventListener('mousemove', e => {
  const glow = document.getElementById('cursor-glow');
  if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }
});

function fmtNum(n) {
  const num = parseFloat(n);
  if (isNaN(num)) return n;
  if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-7 && num !== 0)) return num.toExponential(6);
  return parseFloat(num.toPrecision(12)).toString();
}

function popDisplay(id) {
  const el = document.getElementById(id);
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

function updateStdDisplay() {
  const el = document.getElementById('std-display');
  el.textContent = fmtNum(stdState.current);
  document.getElementById('std-expr').textContent = stdState.expr;
  popDisplay('std-display');
  const len = stdState.current.length;
  el.style.fontSize = len > 16 ? '22px' : len > 12 ? '28px' : len > 8 ? '36px' : '48px';
  const memInd = document.getElementById('std-mem-ind');
  if (memInd) memInd.style.display = stdState.memory !== 0 ? 'inline' : 'none';
}

function stdAction(type, value) {
  switch (type) {
    case 'num':
      if (stdState.shouldReset || stdState.current === '0') {
        stdState.current = value; stdState.shouldReset = false;
      } else {
        if (stdState.current.length >= 16) return;
        stdState.current += value;
      }
      break;
    case 'dot':
      if (stdState.shouldReset) { stdState.current = '0.'; stdState.shouldReset = false; }
      else if (!stdState.current.includes('.')) stdState.current += '.';
      break;
    case 'op':
      if (stdState.operator && !stdState.shouldReset) performStdCalc();
      stdState.prev = stdState.current;
      stdState.operator = value;
      stdState.shouldReset = true;
      stdState.expr = fmtNum(stdState.prev) + ' ' + value;
      break;
    case 'equal':
      if (stdState.operator) {
        const fullExpr = `${fmtNum(parseFloat(stdState.prev))} ${stdState.operator} ${fmtNum(parseFloat(stdState.current))}`;
        performStdCalc();
        addHistory(fullExpr, fmtNum(stdState.current));
        stdState.operator = null; stdState.prev = ''; stdState.expr = '';
      }
      break;
    case 'clear':
      stdState = { current: '0', prev: '', operator: null, shouldReset: false, expr: '', memory: stdState.memory };
      break;
    case 'ce': stdState.current = '0'; break;
    case 'backspace':
      stdState.current = stdState.current.length > 1 ? stdState.current.slice(0, -1) : '0';
      break;
    case 'sign':
      stdState.current = (parseFloat(stdState.current) * -1).toString(); break;
    case 'percent':
      stdState.current = (parseFloat(stdState.current) / 100).toString(); break;
    case 'sq':
      const sq = parseFloat(stdState.current) ** 2;
      addHistory(`sqr(${fmtNum(stdState.current)})`, fmtNum(sq));
      stdState.current = sq.toString(); stdState.shouldReset = true; break;
    case 'sqrt':
      const n = parseFloat(stdState.current);
      if (n < 0) { stdState.current = 'Error'; break; }
      const sr = Math.sqrt(n);
      addHistory(`√(${fmtNum(n)})`, fmtNum(sr));
      stdState.current = sr.toString(); stdState.shouldReset = true; break;
    case 'inv':
      const inv = parseFloat(stdState.current);
      if (inv === 0) { stdState.current = 'Error'; break; }
      const invR = 1 / inv;
      addHistory(`1/(${fmtNum(inv)})`, fmtNum(invR));
      stdState.current = invR.toString(); stdState.shouldReset = true; break;
  }
  updateStdDisplay();
}

function performStdCalc() {
  const prev = parseFloat(stdState.prev);
  const curr = parseFloat(stdState.current);
  let result;
  switch (stdState.operator) {
    case '+': result = prev + curr; break;
    case '−': result = prev - curr; break;
    case '×': result = prev * curr; break;
    case '÷': result = curr === 0 ? 'Error' : prev / curr; break;
    default: result = curr;
  }
  stdState.current = result === 'Error' ? 'Error' : result.toString();
  stdState.shouldReset = true;
  updateStdDisplay();
}

function stdMemory(action) {
  const curr = parseFloat(stdState.current) || 0;
  switch (action) {
    case 'MC': stdState.memory = 0; showToast(t('toast_mem_clear')); break;
    case 'MR': stdState.current = stdState.memory.toString(); stdState.shouldReset = true; break;
    case 'M+': stdState.memory += curr; showToast(t('toast_mem_saved')); break;
    case 'M-': stdState.memory -= curr; showToast(t('toast_mem_saved')); break;
    case 'MS': stdState.memory = curr; showToast(t('toast_mem_saved')); break;
  }
  updateStdDisplay();
}

function updateSciDisplay() {
  const el = document.getElementById('sci-display');
  el.textContent = fmtNum(sciState.current);
  document.getElementById('sci-expr').textContent = sciState.expr;
  popDisplay('sci-display');
  const len = sciState.current.length;
  el.style.fontSize = len > 16 ? '22px' : len > 12 ? '28px' : len > 8 ? '36px' : '48px';
}

function sciStd(type, value) {
  switch (type) {
    case 'num':
      if (sciState.shouldReset || sciState.current === '0') { sciState.current = value; sciState.shouldReset = false; }
      else { if (sciState.current.length >= 16) return; sciState.current += value; }
      break;
    case 'dot':
      if (sciState.shouldReset) { sciState.current = '0.'; sciState.shouldReset = false; }
      else if (!sciState.current.includes('.')) sciState.current += '.';
      break;
    case 'op':
      if (sciState.operator && !sciState.shouldReset) performSciCalc();
      sciState.prev = sciState.current; sciState.operator = value;
      sciState.shouldReset = true; sciState.expr = fmtNum(sciState.prev) + ' ' + value;
      break;
    case 'equal':
      if (sciState.operator) {
        const fullExpr = `${fmtNum(parseFloat(sciState.prev))} ${sciState.operator} ${fmtNum(parseFloat(sciState.current))}`;
        performSciCalc();
        addHistory(fullExpr, fmtNum(sciState.current));
        sciState.operator = null; sciState.prev = ''; sciState.expr = '';
      }
      break;
    case 'clear':
      sciState = { current: '0', prev: '', operator: null, shouldReset: false, expr: '', angleMode: sciState.angleMode, is2nd: sciState.is2nd };
      break;
    case 'backspace':
      sciState.current = sciState.current.length > 1 ? sciState.current.slice(0, -1) : '0'; break;
    case 'sign': sciState.current = (parseFloat(sciState.current) * -1).toString(); break;
    case 'percent': sciState.current = (parseFloat(sciState.current) / 100).toString(); break;
    case 'sq': sciState.current = (parseFloat(sciState.current) ** 2).toString(); sciState.shouldReset = true; break;
    case 'sqrt':
      const n = parseFloat(sciState.current);
      sciState.current = n < 0 ? 'Error' : Math.sqrt(n).toString(); sciState.shouldReset = true; break;
    case 'inv':
      const v = parseFloat(sciState.current);
      sciState.current = v === 0 ? 'Error' : (1 / v).toString(); sciState.shouldReset = true; break;
  }
  updateSciDisplay();
}

function performSciCalc() {
  const prev = parseFloat(sciState.prev);
  const curr = parseFloat(sciState.current);
  let result;
  switch (sciState.operator) {
    case '+': result = prev + curr; break;
    case '−': result = prev - curr; break;
    case '×': result = prev * curr; break;
    case '÷': result = curr === 0 ? 'Error' : prev / curr; break;
    case 'xʸ': result = Math.pow(prev, curr); break;
    default: result = curr;
  }
  sciState.current = result === 'Error' ? 'Error' : result.toString();
  sciState.shouldReset = true;
  updateSciDisplay();
}

function toRadians(val) {
  if (sciState.angleMode === 'DEG') return val * Math.PI / 180;
  if (sciState.angleMode === 'GRAD') return val * Math.PI / 200;
  return val;
}

function sciAction(fn) {
  const curr = parseFloat(sciState.current);
  const is2 = sciState.is2nd;
  let result, label;
  switch (fn) {
    case 'sin':
      result = is2 ? Math.asin(curr) * (sciState.angleMode === 'DEG' ? 180/Math.PI : sciState.angleMode === 'GRAD' ? 200/Math.PI : 1) : Math.sin(toRadians(curr));
      label = is2 ? `asin(${curr})` : `sin(${curr})`; break;
    case 'cos':
      result = is2 ? Math.acos(curr) * (sciState.angleMode === 'DEG' ? 180/Math.PI : sciState.angleMode === 'GRAD' ? 200/Math.PI : 1) : Math.cos(toRadians(curr));
      label = is2 ? `acos(${curr})` : `cos(${curr})`; break;
    case 'tan':
      result = is2 ? Math.atan(curr) * (sciState.angleMode === 'DEG' ? 180/Math.PI : sciState.angleMode === 'GRAD' ? 200/Math.PI : 1) : Math.tan(toRadians(curr));
      label = is2 ? `atan(${curr})` : `tan(${curr})`; break;
    case 'log':
      result = is2 ? Math.pow(10, curr) : Math.log10(curr);
      label = is2 ? `10^(${curr})` : `log(${curr})`; break;
    case 'ln':
      result = is2 ? Math.exp(curr) : Math.log(curr);
      label = is2 ? `e^(${curr})` : `ln(${curr})`; break;
    case 'pi': sciState.current = Math.PI.toString(); sciState.shouldReset = true; updateSciDisplay(); return;
    case 'e': sciState.current = Math.E.toString(); sciState.shouldReset = true; updateSciDisplay(); return;
    case 'pow': sciState.prev = sciState.current; sciState.operator = 'xʸ'; sciState.shouldReset = true; sciState.expr = fmtNum(curr) + ' ^ '; updateSciDisplay(); return;
    case 'exp10': result = Math.pow(10, curr); label = `10^(${curr})`; break;
    case 'factorial': result = factorial(Math.round(curr)); label = `${Math.round(curr)}!`; break;
    case 'abs': result = Math.abs(curr); label = `|${curr}|`; break;
    case 'cbrt': result = Math.cbrt(curr); label = `∛(${curr})`; break;
    default: return;
  }
  if (result !== undefined) {
    const r = isFinite(result) ? parseFloat(result.toPrecision(12)) : result;
    addHistory(label, fmtNum(r));
    sciState.current = r.toString(); sciState.shouldReset = true; updateSciDisplay();
  }
}

function factorial(n) {
  if (n < 0 || n > 170) return Infinity;
  if (n <= 1) return 1;
  let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
}

function setAngleMode(mode) {
  sciState.angleMode = mode;
  ['deg','rad','grad'].forEach(m => {
    document.getElementById('btn-' + m).classList.toggle('active', m.toUpperCase() === mode);
  });
}

function toggle2nd() {
  sciState.is2nd = !sciState.is2nd;
  document.getElementById('btn-2nd').classList.toggle('active', sciState.is2nd);
  const labels = sciState.is2nd
    ? { sin: 'asin', cos: 'acos', tan: 'atan', log: '10ˣ', ln: 'eˣ' }
    : { sin: 'sin', cos: 'cos', tan: 'tan', log: 'log', ln: 'ln' };
  for (const [id, lbl] of Object.entries(labels)) {
    const el = document.getElementById('sci-' + id);
    if (el) el.textContent = lbl;
  }
}

document.addEventListener('keydown', e => {
  const active = document.querySelector('.tab-panel.active')?.id;
  if (!active) return;
  if (active === 'tab-standard') {
    if (e.key >= '0' && e.key <= '9') stdAction('num', e.key);
    else if (e.key === '.') stdAction('dot');
    else if (e.key === '+') stdAction('op', '+');
    else if (e.key === '-') stdAction('op', '−');
    else if (e.key === '*') stdAction('op', '×');
    else if (e.key === '/') { e.preventDefault(); stdAction('op', '÷'); }
    else if (e.key === 'Enter' || e.key === '=') stdAction('equal');
    else if (e.key === 'Backspace') stdAction('backspace');
    else if (e.key === 'Escape') stdAction('clear');
    else if (e.key === '%') stdAction('percent');
  } else if (active === 'tab-scientific') {
    if (e.key >= '0' && e.key <= '9') sciStd('num', e.key);
    else if (e.key === '.') sciStd('dot');
    else if (e.key === '+') sciStd('op', '+');
    else if (e.key === '-') sciStd('op', '−');
    else if (e.key === '*') sciStd('op', '×');
    else if (e.key === '/') { e.preventDefault(); sciStd('op', '÷'); }
    else if (e.key === 'Enter' || e.key === '=') sciStd('equal');
    else if (e.key === 'Backspace') sciStd('backspace');
    else if (e.key === 'Escape') sciStd('clear');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  updateStdDisplay();
  updateSciDisplay();
  if (window.innerWidth > 900) {
    document.getElementById('sidebar').classList.remove('open');
  }
});
