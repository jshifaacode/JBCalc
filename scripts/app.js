
let stdState = {
  current: '0',
  prev: '',
  operator: null,
  shouldReset: false,
  expr: '',
  history: [],
  memory: 0
};

let sciState = {
  current: '0',
  prev: '',
  operator: null,
  shouldReset: false,
  expr: '',
  history: [],
  angleMode: 'DEG',
  is2nd: false
};

let currentTheme = 'dark';
let sidebarOpen = false;

// ── Navigation ──────────────────────────────────────────────
function switchTab(tabName, el) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  el.classList.add('active');
  document.getElementById('mobile-title').textContent = el.querySelector('span:last-child').textContent;

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

// Ganti fungsi navigasi di app.js dengan ini
function toggleSidebar(force) {
  const sidebar = document.getElementById('sidebar');
  let overlay = document.getElementById('sidebar-overlay');

  // Pastikan overlay ada di DOM
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'sidebar-overlay';
    overlay.className = 'sidebar-overlay';
    overlay.onclick = closeSidebar;
    document.body.appendChild(overlay);
  }

  // Gunakan pengecekan class untuk sinkronisasi dengan CSS
  const isOpen = sidebar.classList.contains('open');

  if (force === false || isOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  sidebar.classList.add('open');
  // Gunakan 'show' sesuai CSS milikmu (.sidebar-overlay.show)
  if (overlay) overlay.classList.add('show'); 
  
  sidebarOpen = true;
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  
  sidebarOpen = false;
  document.body.style.overflow = '';
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme === 'light' ? 'light' : '');
  document.getElementById('theme-icon').textContent = currentTheme === 'dark' ? '◑' : '○';
  document.getElementById('theme-label').textContent = currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode';
  showToast(currentTheme === 'light' ? '☀ Light Mode aktif' : '🌙 Dark Mode aktif');
}

// ── Toast ──────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Ripple Effect ──────────────────────────────────────────
document.addEventListener('click', (e) => {
  const key = e.target.closest('.key');
  if (!key) return;
  const rect = key.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple-circle';
  ripple.style.left = (e.clientX - rect.left - 10) + 'px';
  ripple.style.top = (e.clientY - rect.top - 10) + 'px';
  key.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
});

// ── Format Number ──────────────────────────────────────────
function fmtNum(n) {
  const num = parseFloat(n);
  if (isNaN(num)) return n;
  if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
    return num.toExponential(6);
  }
  // max 12 significant digits
  const s = parseFloat(num.toPrecision(12)).toString();
  return s;
}

function popDisplay(id) {
  const el = document.getElementById(id);
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

// ═══════════════════════════════════════════════════════════
// STANDARD CALCULATOR
// ═══════════════════════════════════════════════════════════

function updateStdDisplay() {
  const el = document.getElementById('std-display');
  el.textContent = fmtNum(stdState.current);
  document.getElementById('std-expr').textContent = stdState.expr;
  popDisplay('std-display');

  // Font size adapt
  const len = stdState.current.length;
  el.style.fontSize = len > 14 ? '22px' : len > 10 ? '30px' : len > 7 ? '36px' : '42px';
}

function stdAction(type, value) {
  switch(type) {
    case 'num':
      if (stdState.shouldReset || stdState.current === '0') {
        stdState.current = value;
        stdState.shouldReset = false;
      } else {
        if (stdState.current.length >= 16) return;
        stdState.current += value;
      }
      break;

    case 'dot':
      if (stdState.shouldReset) {
        stdState.current = '0.';
        stdState.shouldReset = false;
      } else if (!stdState.current.includes('.')) {
        stdState.current += '.';
      }
      break;

    case 'op':
      if (stdState.operator && !stdState.shouldReset) {
        performStdCalc();
      }
      stdState.prev = stdState.current;
      stdState.operator = value;
      stdState.shouldReset = true;
      stdState.expr = fmtNum(stdState.prev) + ' ' + value;
      break;

    case 'equal':
      if (stdState.operator) {
        const prev = parseFloat(stdState.prev);
        const curr = parseFloat(stdState.current);
        const fullExpr = `${fmtNum(prev)} ${stdState.operator} ${fmtNum(curr)} =`;
        performStdCalc();
        addStdHistory(fullExpr + ' ' + stdState.current);
        stdState.operator = null;
        stdState.prev = '';
        stdState.expr = '';
      }
      break;

    case 'clear':
      stdState = { current: '0', prev: '', operator: null, shouldReset: false, expr: '', history: stdState.history, memory: stdState.memory };
      break;

    case 'ce':
      stdState.current = '0';
      break;

    case 'backspace':
      if (stdState.current.length > 1) {
        stdState.current = stdState.current.slice(0,-1);
      } else {
        stdState.current = '0';
      }
      break;

    case 'sign':
      stdState.current = (parseFloat(stdState.current) * -1).toString();
      break;

    case 'percent':
      stdState.current = (parseFloat(stdState.current) / 100).toString();
      break;

    case 'sq':
      const sq = parseFloat(stdState.current) ** 2;
      addStdHistory(`sqr(${fmtNum(stdState.current)}) = ${fmtNum(sq)}`);
      stdState.current = sq.toString();
      stdState.shouldReset = true;
      break;

    case 'sqrt':
      const n = parseFloat(stdState.current);
      if (n < 0) { stdState.current = 'Error'; break; }
      const sr = Math.sqrt(n);
      addStdHistory(`√(${fmtNum(n)}) = ${fmtNum(sr)}`);
      stdState.current = sr.toString();
      stdState.shouldReset = true;
      break;

    case 'inv':
      const inv = parseFloat(stdState.current);
      if (inv === 0) { stdState.current = 'Error'; break; }
      const invR = 1 / inv;
      addStdHistory(`1/(${fmtNum(inv)}) = ${fmtNum(invR)}`);
      stdState.current = invR.toString();
      stdState.shouldReset = true;
      break;
  }
  updateStdDisplay();
}

function performStdCalc() {
  const prev = parseFloat(stdState.prev);
  const curr = parseFloat(stdState.current);
  let result;
  switch(stdState.operator) {
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

function addStdHistory(entry) {
  const histEl = document.getElementById('std-history');
  histEl.textContent = entry;
}

// ── Memory ─────────────────────────────────────────────────
function memAction(type) {
  const val = parseFloat(stdState.current);
  switch(type) {
    case 'mc': stdState.memory = 0; showToast('Memori dihapus'); break;
    case 'mr':
      stdState.current = stdState.memory.toString();
      stdState.shouldReset = true;
      updateStdDisplay();
      break;
    case 'm+': stdState.memory += val; showToast(`M = ${fmtNum(stdState.memory)}`); break;
    case 'm-': stdState.memory -= val; showToast(`M = ${fmtNum(stdState.memory)}`); break;
    case 'ms': stdState.memory = val; showToast(`Disimpan M = ${fmtNum(val)}`); break;
  }
}

// ═══════════════════════════════════════════════════════════
// SCIENTIFIC CALCULATOR
// ═══════════════════════════════════════════════════════════

function toRadians(val) {
  if (sciState.angleMode === 'RAD') return val;
  if (sciState.angleMode === 'GRAD') return val * Math.PI / 200;
  return val * Math.PI / 180; // DEG
}

function updateSciDisplay() {
  const el = document.getElementById('sci-display');
  el.textContent = fmtNum(sciState.current);
  document.getElementById('sci-expr').textContent = sciState.expr;
  document.getElementById('sci-history').textContent =
    `Mode: ${sciState.angleMode} | ${sciState.history[sciState.history.length-1] || ''}`;
  popDisplay('sci-display');
  const len = sciState.current.length;
  el.style.fontSize = len > 14 ? '22px' : len > 10 ? '30px' : len > 7 ? '36px' : '42px';
}

function sciStd(type, value) {
  // Mirror standard calc but on sci state
  switch(type) {
    case 'num':
      if (sciState.shouldReset || sciState.current === '0') {
        sciState.current = value;
        sciState.shouldReset = false;
      } else {
        if (sciState.current.length >= 16) return;
        sciState.current += value;
      }
      break;
    case 'dot':
      if (sciState.shouldReset) { sciState.current = '0.'; sciState.shouldReset = false; }
      else if (!sciState.current.includes('.')) sciState.current += '.';
      break;
    case 'op':
      if (sciState.operator && !sciState.shouldReset) performSciCalc();
      sciState.prev = sciState.current;
      sciState.operator = value;
      sciState.shouldReset = true;
      sciState.expr = fmtNum(sciState.prev) + ' ' + value;
      break;
    case 'equal':
      if (sciState.operator) {
        const fullExpr = `${fmtNum(parseFloat(sciState.prev))} ${sciState.operator} ${fmtNum(parseFloat(sciState.current))} =`;
        performSciCalc();
        sciState.history.push(fullExpr + ' ' + sciState.current);
        sciState.operator = null;
        sciState.prev = '';
        sciState.expr = '';
      }
      break;
    case 'clear':
      sciState = { current:'0', prev:'', operator:null, shouldReset:false, expr:'', history:sciState.history, angleMode:sciState.angleMode, is2nd:sciState.is2nd, memory:sciState.memory };
      break;
    case 'backspace':
      if (sciState.current.length > 1) sciState.current = sciState.current.slice(0,-1);
      else sciState.current = '0';
      break;
    case 'sign': sciState.current = (parseFloat(sciState.current)*-1).toString(); break;
    case 'percent': sciState.current = (parseFloat(sciState.current)/100).toString(); break;
    case 'sq':
      sciState.current = (parseFloat(sciState.current)**2).toString();
      sciState.shouldReset = true; break;
    case 'sqrt':
      const n = parseFloat(sciState.current);
      sciState.current = n < 0 ? 'Error' : Math.sqrt(n).toString();
      sciState.shouldReset = true; break;
    case 'inv':
      const v = parseFloat(sciState.current);
      sciState.current = v === 0 ? 'Error' : (1/v).toString();
      sciState.shouldReset = true; break;
  }
  updateSciDisplay();
}

function performSciCalc() {
  const prev = parseFloat(sciState.prev);
  const curr = parseFloat(sciState.current);
  let result;
  switch(sciState.operator) {
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

function sciAction(fn) {
  const curr = parseFloat(sciState.current);
  const is2 = sciState.is2nd;
  let result, label;

  switch(fn) {
    case 'sin':
      result = is2 ? Math.asin(curr) * (sciState.angleMode === 'DEG' ? 180/Math.PI : 1) : Math.sin(toRadians(curr));
      label = is2 ? `asin(${curr})` : `sin(${curr})`;
      break;
    case 'cos':
      result = is2 ? Math.acos(curr) * (sciState.angleMode === 'DEG' ? 180/Math.PI : 1) : Math.cos(toRadians(curr));
      label = is2 ? `acos(${curr})` : `cos(${curr})`;
      break;
    case 'tan':
      result = is2 ? Math.atan(curr) * (sciState.angleMode === 'DEG' ? 180/Math.PI : 1) : Math.tan(toRadians(curr));
      label = is2 ? `atan(${curr})` : `tan(${curr})`;
      break;
    case 'log':
      result = is2 ? Math.pow(10, curr) : Math.log10(curr);
      label = is2 ? `10^(${curr})` : `log(${curr})`;
      break;
    case 'ln':
      result = is2 ? Math.exp(curr) : Math.log(curr);
      label = is2 ? `e^(${curr})` : `ln(${curr})`;
      break;
    case 'pi':
      sciState.current = Math.PI.toString(); sciState.shouldReset = true;
      updateSciDisplay(); return;
    case 'e':
      sciState.current = Math.E.toString(); sciState.shouldReset = true;
      updateSciDisplay(); return;
    case 'pow':
      sciState.prev = sciState.current;
      sciState.operator = 'xʸ';
      sciState.shouldReset = true;
      sciState.expr = fmtNum(curr) + ' ^ ';
      updateSciDisplay(); return;
    case 'exp10':
      result = Math.pow(10, curr); label = `10^(${curr})`;
      break;
    case 'exp2':
      result = Math.pow(2, curr); label = `2^(${curr})`;
      break;
    case 'openParen': return;
    case 'closeParen': return;
    case 'factorial':
      result = factorial(Math.round(curr)); label = `${Math.round(curr)}!`;
      break;
    case 'abs':
      result = Math.abs(curr); label = `|${curr}|`;
      break;
    case 'cbrt':
      result = Math.cbrt(curr); label = `∛(${curr})`;
      break;
    default: return;
  }

  if (result !== undefined) {
    const r = parseFloat(result.toPrecision(12));
    sciState.history.push(`${label} = ${fmtNum(r)}`);
    sciState.current = r.toString();
    sciState.shouldReset = true;
    updateSciDisplay();
  }
}

function factorial(n) {
  if (n < 0 || n > 170) return Infinity;
  if (n === 0 || n === 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function setAngleMode(mode) {
  sciState.angleMode = mode;
  ['deg','rad','grad'].forEach(m => {
    document.getElementById('btn-'+m).classList.toggle('active', m.toUpperCase() === mode);
  });
  updateSciDisplay();
}

function toggle2nd() {
  sciState.is2nd = !sciState.is2nd;
  document.getElementById('btn-2nd').classList.toggle('active', sciState.is2nd);
  // Update button labels
  const labels = sciState.is2nd
    ? { sin:'asin', cos:'acos', tan:'atan', log:'10ˣ', ln:'eˣ' }
    : { sin:'sin', cos:'cos', tan:'tan', log:'log', ln:'ln' };
  for (const [id, label] of Object.entries(labels)) {
    const el = document.getElementById('sci-'+id);
    if (el) el.textContent = label;
  }
}

// ── Keyboard Support ───────────────────────────────────────
document.addEventListener('keydown', (e) => {
  const active = document.querySelector('.tab-panel.active').id;
  const isStd = active === 'tab-standard';
  const isSci = active === 'tab-scientific';

  if (!isStd && !isSci) return;
  const action = isStd ? stdAction : sciStd;

  if (e.key >= '0' && e.key <= '9') action('num', e.key);
  else if (e.key === '.') action('dot');
  else if (e.key === '+') action('op', '+');
  else if (e.key === '-') action('op', '−');
  else if (e.key === '*') action('op', '×');
  else if (e.key === '/') { e.preventDefault(); action('op', '÷'); }
  else if (e.key === 'Enter' || e.key === '=') action('equal');
  else if (e.key === 'Backspace') action('backspace');
  else if (e.key === 'Escape') action('clear');
  else if (e.key === '%') action('percent');
});

// ── Init ───────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  updateStdDisplay();
  updateSciDisplay();
});

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
  
  sidebarOpen = false;
  document.body.style.overflow = ''; // Mengaktifkan scroll kembali
}


function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar.classList.contains('open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
}
