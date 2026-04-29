const UNIT_CATEGORIES = {
  temperature: {
    label: 'Suhu', units: ['°C (Celsius)', '°F (Fahrenheit)', 'K (Kelvin)', '°R (Rankine)', '°Ré (Réaumur)'],
    ids: ['C','F','K','R','Re'],
    convert(val, from, to) {
      let c;
      switch(from) { case 'C': c=val; break; case 'F': c=(val-32)*5/9; break; case 'K': c=val-273.15; break; case 'R': c=(val-491.67)*5/9; break; case 'Re': c=val*5/4; break; }
      switch(to) { case 'C': return c; case 'F': return c*9/5+32; case 'K': return c+273.15; case 'R': return (c+273.15)*9/5; case 'Re': return c*4/5; }
    },
    formula(from, to) {
      const map = { 'C→F':'°F = °C × 9/5 + 32','F→C':'°C = (°F − 32) × 5/9','C→K':'K = °C + 273.15','K→C':'°C = K − 273.15','C→R':'°R = (°C + 273.15) × 9/5' };
      return map[`${from}→${to}`] || `${from} → ${to}`;
    }
  },
  length: {
    label: 'Panjang', units: ['Meter (m)','Kilometer (km)','Centimeter (cm)','Millimeter (mm)','Inch (in)','Feet (ft)','Yard (yd)','Mile (mi)','Nautical Mile (nmi)','Light Year (ly)','Angstrom (Å)'],
    ids: ['m','km','cm','mm','in','ft','yd','mi','nmi','ly','ang'],
    toBase: { m:1,km:1000,cm:0.01,mm:0.001,in:0.0254,ft:0.3048,yd:0.9144,mi:1609.344,nmi:1852,ly:9.461e15,ang:1e-10 },
    convert(v,f,t) { return v*this.toBase[f]/this.toBase[t]; },
    formula(f,t) { return `1 ${f} = ${(this.toBase[f]/this.toBase[t]).toPrecision(6)} ${t}`; }
  },
  weight: {
    label: 'Berat / Massa', units: ['Kilogram (kg)','Gram (g)','Milligram (mg)','Ton (t)','Pound (lb)','Ounce (oz)','Carat (ct)','Grain (gr)','Stone (st)'],
    ids: ['kg','g','mg','t','lb','oz','ct','gr','st'],
    toBase: { kg:1,g:0.001,mg:1e-6,t:1000,lb:0.453592,oz:0.0283495,ct:0.0002,gr:0.0000647989,st:6.35029 },
    convert(v,f,t) { return v*this.toBase[f]/this.toBase[t]; },
    formula(f,t) { return `1 ${f} = ${(this.toBase[f]/this.toBase[t]).toPrecision(6)} ${t}`; }
  },
  volume: {
    label: 'Volume', units: ['Liter (L)','Milliliter (mL)','Cubic Meter (m³)','Cubic cm (cm³)','Gallon US (gal)','Quart (qt)','Pint (pt)','Cup (cup)','Fluid Ounce (fl oz)','Tablespoon (tbsp)','Teaspoon (tsp)'],
    ids: ['L','mL','m3','cm3','gal','qt','pt','cup','floz','tbsp','tsp'],
    toBase: { L:1,mL:0.001,m3:1000,cm3:0.001,gal:3.78541,qt:0.946353,pt:0.473176,cup:0.236588,floz:0.0295735,tbsp:0.0147868,tsp:0.00492892 },
    convert(v,f,t) { return v*this.toBase[f]/this.toBase[t]; },
    formula(f,t) { return `1 ${f} = ${(this.toBase[f]/this.toBase[t]).toPrecision(6)} ${t}`; }
  },
  area: {
    label: 'Luas', units: ['Square Meter (m²)','Square km (km²)','Hectare (ha)','Are (a)','Square cm (cm²)','Square Inch (in²)','Square Feet (ft²)','Square Yard (yd²)','Acre (ac)','Square Mile (mi²)'],
    ids: ['m2','km2','ha','a','cm2','in2','ft2','yd2','ac','mi2'],
    toBase: { m2:1,km2:1e6,ha:10000,a:100,cm2:0.0001,in2:0.00064516,ft2:0.092903,yd2:0.836127,ac:4046.86,mi2:2.59e6 },
    convert(v,f,t) { return v*this.toBase[f]/this.toBase[t]; },
    formula(f,t) { return `1 ${f} = ${(this.toBase[f]/this.toBase[t]).toPrecision(6)} ${t}`; }
  },
  speed: {
    label: 'Kecepatan', units: ['m/s','km/h','mph','Knot (kn)','ft/s','Mach (Ma)'],
    ids: ['ms','kmh','mph','kn','fts','mach'],
    toBase: { ms:1,kmh:1/3.6,mph:0.44704,kn:0.514444,fts:0.3048,mach:340.29 },
    convert(v,f,t) { return v*this.toBase[f]/this.toBase[t]; },
    formula(f,t) { return `1 ${f} = ${(this.toBase[f]/this.toBase[t]).toPrecision(6)} ${t}`; }
  },
  data: {
    label: 'Data Digital', units: ['Bit (b)','Byte (B)','Kilobyte (KB)','Megabyte (MB)','Gigabyte (GB)','Terabyte (TB)','Petabyte (PB)','Kibibyte (KiB)','Mebibyte (MiB)','Gibibyte (GiB)'],
    ids: ['bit','B','KB','MB','GB','TB','PB','KiB','MiB','GiB'],
    toBase: { bit:1,B:8,KB:8000,MB:8e6,GB:8e9,TB:8e12,PB:8e15,KiB:8192,MiB:8388608,GiB:8589934592 },
    convert(v,f,t) { return v*this.toBase[f]/this.toBase[t]; },
    formula(f,t) { return `1 ${f} = ${(this.toBase[f]/this.toBase[t]).toPrecision(6)} ${t}`; }
  },
  time: {
    label: 'Waktu', units: ['Nanosecond (ns)','Microsecond (μs)','Millisecond (ms)','Second (s)','Minute (min)','Hour (h)','Day (d)','Week (wk)','Month (mo)','Year (yr)','Decade','Century'],
    ids: ['ns','us','ms','s','min','h','d','wk','mo','yr','dec','cen'],
    toBase: { ns:1e-9,us:1e-6,ms:0.001,s:1,min:60,h:3600,d:86400,wk:604800,mo:2629800,yr:31557600,dec:315576000,cen:3155760000 },
    convert(v,f,t) { return v*this.toBase[f]/this.toBase[t]; },
    formula(f,t) { return `1 ${f} = ${(this.toBase[f]/this.toBase[t]).toPrecision(6)} ${t}`; }
  },
  energy: {
    label: 'Energi', units: ['Joule (J)','Kilojoule (kJ)','Calorie (cal)','Kilocalorie (kcal)','Watt-hour (Wh)','kWh','eV','BTU','erg','Foot-pound (ft·lb)'],
    ids: ['J','kJ','cal','kcal','Wh','kWh','eV','BTU','erg','ftlb'],
    toBase: { J:1,kJ:1000,cal:4.184,kcal:4184,Wh:3600,kWh:3.6e6,eV:1.602e-19,BTU:1055.06,erg:1e-7,ftlb:1.35582 },
    convert(v,f,t) { return v*this.toBase[f]/this.toBase[t]; },
    formula(f,t) { return `1 ${f} = ${(this.toBase[f]/this.toBase[t]).toPrecision(6)} ${t}`; }
  },
  pressure: {
    label: 'Tekanan', units: ['Pascal (Pa)','Kilopascal (kPa)','Bar','Atmosphere (atm)','PSI','mmHg (torr)','inHg','Millibar (mbar)'],
    ids: ['Pa','kPa','bar','atm','psi','mmHg','inHg','mbar'],
    toBase: { Pa:1,kPa:1000,bar:100000,atm:101325,psi:6894.76,mmHg:133.322,inHg:3386.39,mbar:100 },
    convert(v,f,t) { return v*this.toBase[f]/this.toBase[t]; },
    formula(f,t) { return `1 ${f} = ${(this.toBase[f]/this.toBase[t]).toPrecision(6)} ${t}`; }
  }
};

let currentUnitCat = 'temperature';

function setUnitCat(cat, el) {
  currentUnitCat = cat;
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  buildUnitSelects();
  convertUnit();
  buildUnitTable();
}

function buildUnitSelects() {
  const cat = UNIT_CATEGORIES[currentUnitCat];
  const fromSel = document.getElementById('unit-from');
  const toSel = document.getElementById('unit-to');
  if (!fromSel || !toSel) return;
  const opts = cat.units.map((u, i) => `<option value="${cat.ids[i]}">${u}</option>`).join('');
  fromSel.innerHTML = opts; toSel.innerHTML = opts;
  fromSel.selectedIndex = 0; toSel.selectedIndex = Math.min(1, cat.ids.length - 1);
}

function convertUnit() {
  const cat = UNIT_CATEGORIES[currentUnitCat];
  const from = document.getElementById('unit-from')?.value;
  const to = document.getElementById('unit-to')?.value;
  const amount = parseFloat(document.getElementById('unit-amount')?.value);
  if (!from || !to || isNaN(amount)) return;
  const result = cat.convert(amount, from, to);
  let formatted;
  if (Math.abs(result) >= 1e10 || (Math.abs(result) < 1e-4 && result !== 0)) formatted = result.toExponential(6);
  else formatted = parseFloat(result.toPrecision(10)).toString();
  const el = document.getElementById('unit-result');
  if (el) { el.textContent = formatted + ' ' + to; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; }
  const formula = document.getElementById('unit-formula');
  if (formula) formula.textContent = cat.formula ? cat.formula(from, to) : '';
  buildUnitTable();
}

function swapUnit() {
  const from = document.getElementById('unit-from');
  const to = document.getElementById('unit-to');
  const tmp = from.value; from.value = to.value; to.value = tmp;
  convertUnit();
}

function buildUnitTable() {
  const cat = UNIT_CATEGORIES[currentUnitCat];
  const from = document.getElementById('unit-from')?.value;
  const amount = parseFloat(document.getElementById('unit-amount')?.value) || 1;
  const titleEl = document.getElementById('unit-table-title');
  const tableEl = document.getElementById('unit-table');
  if (!titleEl || !tableEl || !from) return;
  titleEl.textContent = `Tabel Konversi ${cat.label} (dari ${amount} ${from})`;
  tableEl.innerHTML = cat.ids.map((id, i) => {
    const result = cat.convert(amount, from, id);
    let fmt;
    if (Math.abs(result) >= 1e10 || (Math.abs(result) < 1e-5 && result !== 0)) fmt = result.toExponential(4);
    else fmt = parseFloat(result.toPrecision(8)).toString();
    return `<div class="unit-chip"><div class="unit-chip-from">${cat.units[i]}</div><div class="unit-chip-to">${fmt} ${id}</div></div>`;
  }).join('');
}

window.addEventListener('DOMContentLoaded', () => {
  buildUnitSelects();
  convertUnit();
  buildUnitTable();
});
