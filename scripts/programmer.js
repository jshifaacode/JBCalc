let progCurrentHex = '0';
let progMode = 'dec';

function progFromDec() {
  const raw = document.getElementById('prog-dec').value.trim();
  const val = parseInt(raw, 10);
  if (raw === '' || raw === '-') { updateProgBases(0); return; }
  if (isNaN(val)) { document.getElementById('prog-dec').value = '0'; updateProgBases(0); return; }
  updateProgBases(val);
}

function progInput(char) {
  const input = document.getElementById('prog-dec');
  const isHexChar = /[A-F]/.test(char);
  const current = input.value === '0' ? '' : input.value;
  input.value = current + char;
  progFromDec();
}

function progClear() {
  document.getElementById('prog-dec').value = '0';
  updateProgBases(0);
}

function progBackspace() {
  const input = document.getElementById('prog-dec');
  input.value = input.value.length > 1 ? input.value.slice(0, -1) : '0';
  progFromDec();
}

function updateProgBases(val) {
  const n = Math.trunc(val) || 0;
  const unsigned = n >>> 0;
  document.getElementById('prog-hex').textContent = n < 0 ? '-' + (-n).toString(16).toUpperCase() : n.toString(16).toUpperCase() || '0';
  document.getElementById('prog-oct').textContent = n < 0 ? '-' + (-n).toString(8) : n.toString(8) || '0';
  const binStr = (unsigned >>> 0).toString(2).padStart(32, '0');
  document.getElementById('prog-bin').textContent = binStr.replace(/(.{4})/g, '$1 ').trim();
  buildBitVisualizer(unsigned);
}

function buildBitVisualizer(val) {
  const container = document.getElementById('bit-viz');
  const bits = (val >>> 0).toString(2).padStart(32, '0').split('');
  container.innerHTML = bits.map((b, i) => {
    const pos = 31 - i;
    if (i > 0 && i % 4 === 0 && i % 8 !== 0) {
      return `<span class="bit-cell separator">·</span><span class="bit-cell ${b === '1' ? 'one' : 'zero'}" onclick="toggleBit(${pos})" title="Bit ${pos}">${b}</span>`;
    }
    return `<span class="bit-cell ${b === '1' ? 'one' : 'zero'}" onclick="toggleBit(${pos})" title="Bit ${pos}">${b}</span>`;
  }).join('');
}

function toggleBit(pos) {
  const input = document.getElementById('prog-dec');
  const val = parseInt(input.value, 10) || 0;
  const toggled = val ^ (1 << pos);
  input.value = toggled.toString();
  progFromDec();
}

function progBitOp(op) {
  const val = parseInt(document.getElementById('prog-dec').value, 10) || 0;
  let result;
  switch (op) {
    case 'NOT': result = ~val; break;
    case 'LSHIFT': result = val << 1; break;
    case 'RSHIFT': result = val >> 1; break;
    default:
      const second = parseInt(prompt(op + ' with:'), 10);
      if (isNaN(second)) return;
      if (op === 'AND') result = val & second;
      else if (op === 'OR') result = val | second;
      else if (op === 'XOR') result = val ^ second;
  }
  document.getElementById('prog-dec').value = result.toString();
  progFromDec();
}

function copyBase(base) {
  let text = '';
  if (base === 'dec') text = document.getElementById('prog-dec').value;
  else if (base === 'hex') text = document.getElementById('prog-hex').textContent;
  else if (base === 'oct') text = document.getElementById('prog-oct').textContent;
  else if (base === 'bin') text = document.getElementById('prog-bin').textContent.replace(/\s/g, '');
  navigator.clipboard.writeText(text).then(() => showToast(t('toast_copied') + ' [' + base.toUpperCase() + ']', 'success'));
}

window.addEventListener('DOMContentLoaded', () => {
  updateProgBases(0);
});
