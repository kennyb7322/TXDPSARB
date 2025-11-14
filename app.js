
// TXDPS ARB Intake Application
// Note: XLSX export uses an optional local vendor file vendor/xlsx.full.min.js (SheetJS).
// If not present, the app falls back to CSV export.

const state = {
  schema: null,
  answers: {},
  attachments: [],
  currentSectionIndex: 0,
  visibleSections: [],
};

const el = (sel) => document.querySelector(sel);
const els = (sel) => Array.from(document.querySelectorAll(sel));

// Utility: debounce
const debounce = (fn, wait=300) => {
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); };
};

// Load schema and documentation
async function init(){
  const year = new Date().getFullYear();
  el('#year').textContent = year;

  const [schema, docs] = await Promise.all([
    fetch('questions.json').then(r=>r.json()),
    fetch('docs/documentation.md').then(r=>r.text()).catch(()=> 'TXDPS ARB Documentation placeholder.')
  ]);
  state.schema = schema;
  el('#docsContent').textContent = docs;

  // Initial render
  computeVisibleSections();
  renderTOC();
  renderSection(0);
  updateProgress();
  updateDashboard();

  // Wire UI handlers
  el('#btnNext').addEventListener('click', ()=>navSection(1));
  el('#btnPrev').addEventListener('click', ()=>navSection(-1));
  el('#btnSubmit').addEventListener('click', onSubmit);
  el('#btnDocs').addEventListener('click', toggleDocs);
  el('#btnDashboard').addEventListener('click', showDashboard);
  el('#btnForm').addEventListener('click', showForm);
  el('#btnSaveDraft').addEventListener('click', saveDraft);
  el('#btnLoadDraft').addEventListener('click', loadDraft);
  el('#btnClear').addEventListener('click', clearAll);
  el('#sectionSearch').addEventListener('input', debounce(filterSections, 150));

  el('#btnExportXLSX').addEventListener('click', exportXLSX);
  el('#btnExportCSV').addEventListener('click', exportCSV);
  el('#btnExportJSON').addEventListener('click', exportJSON);
  el('#btnExportHTML').addEventListener('click', exportHTML);

  // Breadcrumb home
  el('#breadcrumb').addEventListener('click', (e)=>{
    const a = e.target.closest('a[data-nav]');
    if(!a) return;
    e.preventDefault();
    const nav = a.getAttribute('data-nav');
    if(nav === 'home'){ renderSection(0); }
  });

  // Deep link ?goto=sectionId
  const params = new URLSearchParams(location.search);
  const goto = params.get('goto');
  if (goto){
    const idx = state.visibleSections.findIndex(s => s.id === goto);
    if (idx >= 0) renderSection(idx);
  }

  // Try to restore a draft
  try {
    const draft = JSON.parse(localStorage.getItem('arb-draft')||'null');
    if(draft && draft.answers){
      state.answers = draft.answers;
      state.attachments = draft.attachments||[];
      computeVisibleSections();
      renderTOC();
      renderSection(state.currentSectionIndex);
      updateProgress();
      updateDashboard();
    }
  } catch(err){ console.warn(err); }
}

function computeVisibleSections(){
  state.visibleSections = state.schema.sections.filter(sec => {
    if(!sec.branch) return true;
    return evaluateShowWhen(sec.branch.showWhen, state.answers);
  });
}

function evaluateShowWhen(conditions, answers){
  // conditions: { fieldId: [acceptedValues], ... }
  if(!conditions) return true;
  return Object.entries(conditions).every(([field, acc])=>{
    const value = answers[field];
    if (Array.isArray(value)){
      return value.some(v => acc.includes(v));
    } else {
      return acc.includes(value);
    }
  });
}

// Render TOC
function renderTOC(){
  const ul = el('#sectionList');
  ul.innerHTML = '';
  state.visibleSections.forEach((sec, i)=>{
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = `<span>${i+1}.</span> ${sec.title} <span class="muted">[${sec.domain}]</span>`;
    btn.addEventListener('click', ()=>renderSection(i));
    li.appendChild(btn);
    ul.appendChild(li);
  });
  highlightActiveTOC();
}

function highlightActiveTOC(){
  els('#sectionList button').forEach((b, i)=>{
    b.classList.toggle('active', i === state.currentSectionIndex);
  });
}

// Render current section's fields
function renderSection(index){
  if(index < 0 || index >= state.visibleSections.length) return;
  state.currentSectionIndex = index;
  const sec = state.visibleSections[index];
  const container = el('#formContainer');
  container.innerHTML = '';

  // Breadcrumb
  const bc = el('#breadcrumb');
  bc.innerHTML = `<li><a href="#" data-nav="home">Start</a></li><li>${sec.title}</li>`;

  const header = document.createElement('h3');
  header.textContent = sec.title;
  container.appendChild(header);

  const help = document.createElement('p');
  help.className = 'muted';
  help.textContent = sec.help || '';
  container.appendChild(help);

  // Fields
  (sec.fields||[]).forEach(field => {
    if(field.branch && field.branch.showWhen && !evaluateShowWhen(field.branch.showWhen, state.answers)){
      return; // skip hidden field
    }
    const tpl = document.getElementById('fieldTemplate');
    const node = tpl.content.firstElementChild.cloneNode(true);
    const label = node.querySelector('label');
    const wrap = node.querySelector('.input-wrap');
    const help = node.querySelector('.help');
    label.innerHTML = `${field.label}${field.required ? ' *' : ''}`;
    if(field.tooltip){
      const tip = document.createElement('a');
      tip.href='javascript:void(0)';
      tip.className='tooltip-icon';
      tip.title = field.tooltip;
      tip.setAttribute('aria-label', field.tooltip);
      tip.textContent='?';
      label.appendChild(tip);
    }
    if(field.help) help.textContent = field.help;

    let input;
    const val = state.answers[field.id];

    switch(field.type){
      case 'text':
      case 'email':
      case 'number': {
        input = document.createElement('input');
        input.type = field.type;
        if(field.min !== undefined) input.min = field.min;
        if(field.max !== undefined) input.max = field.max;
        input.value = val || '';
        break;
      }
      case 'textarea': {
        input = document.createElement('textarea');
        input.rows = field.rows || 3;
        input.value = val || '';
        break;
      }
      case 'select': {
        input = document.createElement('select');
        input.innerHTML = `<option value="" disabled ${val? '' : 'selected'}>Select…</option>` + 
          (field.options||[]).map(o=>`<option value="${o}">${o}</option>`).join('');
        input.value = val || '';
        break;
      }
      case 'checkbox': {
        input = document.createElement('div');
        (field.options||[]).forEach(opt=>{
          const id = `${field.id}_${opt.replace(/\W+/g,'_')}`;
          const w = document.createElement('div');
          const cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = id;
          cb.checked = Array.isArray(val) ? val.includes(opt) : false;
          const lb = document.createElement('label'); lb.htmlFor = id; lb.textContent = opt;
          w.append(cb, lb); input.appendChild(w);
        });
        break;
      }
      case 'radio': {
        input = document.createElement('div');
        (field.options||[]).forEach(opt=>{
          const id = `${field.id}_${opt.replace(/\W+/g,'_')}`;
          const w = document.createElement('div');
          const rb = document.createElement('input'); rb.type = 'radio'; rb.name = field.id; rb.id = id; rb.value = opt;
          rb.checked = (val === opt);
          const lb = document.createElement('label'); lb.htmlFor = id; lb.textContent = opt;
          w.append(rb, lb); input.appendChild(w);
        });
        break;
      }
      case 'toggle': {
        input = document.createElement('input');
        input.type = 'checkbox';
        input.role = 'switch';
        input.checked = !!val;
        break;
      }
      case 'multitext': {
        input = document.createElement('textarea');
        input.rows = 3;
        input.placeholder = field.placeholder || 'Enter values, one per line';
        if(Array.isArray(val)) input.value = val.join('\\n');
        else input.value = val || '';
        break;
      }
      default: {
        input = document.createElement('input'); input.type='text'; input.value = val || '';
      }
    }

    input.addEventListener('input', debounce(()=>onFieldChange(field, input), 10));
    wrap.appendChild(input);
    container.appendChild(node);
  });

  el('#btnPrev').disabled = (index === 0);
  el('#btnNext').disabled = (index >= state.visibleSections.length-1);
  highlightActiveTOC();
  updateProgress();
  showForm();
}

function onFieldChange(field, input){
  let value;
  switch(field.type){
    case 'checkbox': {
      value = Array.from(input.querySelectorAll('input[type="checkbox"]:checked')).map(c=>c.nextSibling.textContent);
      break;
    }
    case 'radio': {
      const rb = input.querySelector('input[type="radio"]:checked');
      value = rb ? rb.value : '';
      break;
    }
    case 'toggle': {
      value = input.checked;
      break;
    }
    case 'multitext': {
      value = input.value.split(/\\r?\\n/).map(s=>s.trim()).filter(Boolean);
      break;
    }
    case 'number': {
      value = input.value ? Number(input.value) : '';
      break;
    }
    default: {
      value = input.value;
    }
  }

  state.answers[field.id] = value;

  // Attachments field has special behavior: store as tagged docs
  if(field.id === 'attachments'){
    state.attachments = Array.isArray(value) ? value.map(name => ({name, tags:[], domain:guessDomainFromExt(name)})) : [];
  }

  // Recompute visible sections (branching) if any answers affect it
  computeVisibleSections();
  renderTOC();
  updateProgress();
  updateDashboard();
}

function guessDomainFromExt(name){
  const ext = (name.split('.').pop()||'').toLowerCase();
  if(['vsdx','drawio','png','jpg','svg'].includes(ext)) return 'D';
  if(['doc','docx','pdf'].includes(ext)) return 'R';
  if(['csv','xlsx','xls','json','parquet'].includes(ext)) return 'D';
  return 'R';
}

function navSection(delta){
  const newIndex = state.currentSectionIndex + delta;
  if(newIndex >= 0 && newIndex < state.visibleSections.length){
    renderSection(newIndex);
  }
}

// Progress calculation
function updateProgress(){
  const requiredFields = [];
  state.schema.sections.forEach(sec=>{
    // include required fields that are visible by section + field branch
    const secVisible = !sec.branch || evaluateShowWhen(sec.branch.showWhen, state.answers);
    if(!secVisible) return;
    (sec.fields||[]).forEach(f=>{
      let visible = true;
      if (f.branch && f.branch.showWhen){
        visible = evaluateShowWhen(f.branch.showWhen, state.answers);
      }
      if(visible && f.required){
        requiredFields.push(f);
      }
    });
  });

  const total = requiredFields.length || 1;
  const completed = requiredFields.filter(f=>{
    const v = state.answers[f.id];
    if(Array.isArray(v)) return v.length>0;
    return v !== undefined && v !== null && v !== '';
  }).length;
  const pct = Math.round((completed/total)*100);
  el('#progress').value = pct;
  el('#progressText').textContent = `${pct}% Complete`;
  el('#dashCompletion').textContent = `${pct}%`;

  // Domains answered
  const domains = new Set(state.schema.domains.map(d=>d.code));
  const answeredByDomain = new Map();
  state.schema.sections.forEach(sec=>{
    const secVisible = !sec.branch || evaluateShowWhen(sec.branch.showWhen, state.answers);
    if(!secVisible) return;
    const hasAnswer = (sec.fields||[]).some(f=>{
      const v = state.answers[f.id];
      if(Array.isArray(v)) return v.length>0;
      return v !== undefined && v !== null && v !== '';
    });
    if(hasAnswer){
      answeredByDomain.set(sec.domain, true);
    }
  });
  el('#dashDomains').textContent = `${answeredByDomain.size}/${domains.size}`;

  // Domain breakdown bars
  const breakdown = el('#domainBreakdown');
  breakdown.innerHTML = '';
  state.schema.domains.forEach(dom => {
    const secs = state.schema.sections.filter(s => s.domain === dom.code);
    const vis = secs.filter(s => !s.branch || evaluateShowWhen(s.branch.showWhen, state.answers));
    const fields = vis.flatMap(s=>s.fields||[]);
    const totals = fields.length || 1;
    const done = fields.filter(f=>{
      const v = state.answers[f.id];
      if(Array.isArray(v)) return v.length>0;
      return v !== undefined && v !== null && v !== '';
    }).length;
    const pctD = Math.round((done/totals)*100);
    const row = document.createElement('div');
    row.className = 'rowline';
    row.innerHTML = `<span style="min-width:280px">${dom.code} — ${dom.name}</span>
      <div class="bar"><span style="width:${pctD}%"></span></div>
      <span>${pctD}%</span>`;
    breakdown.appendChild(row);
  });

  // Docs
  el('#dashDocs').textContent = state.attachments.length;
}

function filterSections(e){
  const q = (e.target.value||'').toLowerCase();
  els('#sectionList li').forEach(li=>{
    const t = li.textContent.toLowerCase();
    li.style.display = t.includes(q) ? '' : 'none';
  });
}

function toggleDocs(){
  const drawer = el('#docsDrawer');
  drawer.hidden = !drawer.hidden;
  if(!drawer.hidden){
    drawer.querySelector('#docsContent').focus();
  }
}

function showDashboard(){
  el('#dashboardView').hidden = false;
  el('#formView').hidden = true;
  el('#btnForm').hidden = false;
  el('#btnDashboard').hidden = true;
}

function showForm(){
  el('#dashboardView').hidden = true;
  el('#formView').hidden = false;
  el('#btnForm').hidden = true;
  el('#btnDashboard').hidden = false;
}

function saveDraft(){
  const payload = { answers: state.answers, attachments: state.attachments, ts: new Date().toISOString() };
  localStorage.setItem('arb-draft', JSON.stringify(payload));
  alert('Draft saved to browser storage.');
}

function loadDraft(){
  try{
    const payload = JSON.parse(localStorage.getItem('arb-draft')||'null');
    if(!payload) return alert('No draft found.');
    state.answers = payload.answers||{};
    state.attachments = payload.attachments||[];
    computeVisibleSections();
    renderTOC();
    renderSection(state.currentSectionIndex);
    updateProgress();
    updateDashboard();
    alert('Draft loaded.');
  }catch(err){
    console.error(err); alert('Unable to load draft.');
  }
}

function clearAll(){
  if(!confirm('Clear all answers?')) return;
  state.answers = {}; state.attachments = [];
  computeVisibleSections();
  renderTOC();
  renderSection(0);
  updateProgress();
  updateDashboard();
}

// Submission -> export + provide JSON object to Power Automate
function onSubmit(){
  // Check required fields
  const missing = [];
  state.schema.sections.forEach(sec=>{
    const visibleSec = !sec.branch || evaluateShowWhen(sec.branch.showWhen, state.answers);
    if(!visibleSec) return;
    (sec.fields||[]).forEach(f=>{
      let visible = true;
      if(f.branch && f.branch.showWhen){
        visible = evaluateShowWhen(f.branch.showWhen, state.answers);
      }
      if(visible && f.required){
        const v = state.answers[f.id];
        const has = Array.isArray(v) ? v.length>0 : (v!==undefined && v!==null && v!=='');
        if(!has) missing.push(`${sec.title} → ${f.label}`);
      }
    });
  });
  if(missing.length){
    alert('Please complete required fields:\\n' + missing.join('\\n'));
    return;
  }

  showDashboard();
  exportJSON(); // always export JSON representation
}

// Prepare flat rows for Excel/CSV
function makeFlatRows(){
  const row = {
    SubmittedAt: new Date().toISOString(),
  };
  // Map answers by id to columns
  state.schema.sections.forEach(sec=>{
    const secVisible = !sec.branch || evaluateShowWhen(sec.branch.showWhen, state.answers);
    if(!secVisible) return;
    (sec.fields||[]).forEach(f=>{
      const visible = !f.branch || evaluateShowWhen(f.branch.showWhen, state.answers);
      if(!visible) return;
      const v = state.answers[f.id];
      const key = `${sec.id}.${f.id}`;
      if(Array.isArray(v)) row[key] = v.join('; ');
      else row[key] = (v===undefined||v===null) ? '' : String(v);
    });
  });
  row.Attachments = state.attachments.map(a=>a.name).join('; ');
  row.Tags = state.attachments.map(a=>`${a.name} [${a.domain}${(a.tags||[]).length?':'+a.tags.join(','):''}]`).join(' | ');
  return [row];
}

// Exporters
function exportXLSX(){
  const hasXLSX = typeof XLSX !== 'undefined';
  if(!hasXLSX){
    alert('xlsx.full.min.js not found in vendor/. Falling back to CSV. (Place SheetJS in vendor/ to enable XLSX export.)');
    exportCSV();
    return;
  }
  const rows = makeFlatRows();
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'ARB');
  const wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
  const blob = new Blob([wbout], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TXDPS_ARB_Submission_${Date.now()}.xlsx`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

function exportCSV(){
  const rows = makeFlatRows();
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')].concat(rows.map(r=>headers.map(h=>csvEscape(r[h])).join(',')));
  const csv = lines.join('\\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TXDPS_ARB_Submission_${Date.now()}.csv`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

function csvEscape(v){
  if(v==null) return '';
  const s = String(v);
  if(/[",\\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
  return s;
}

function exportJSON(){
  const payload = {
    meta: { tool: 'TXDPS ARB', version: '1.0.0', submittedAt: new Date().toISOString() },
    answers: state.answers,
    attachments: state.attachments,
    derived: {
      completion: Number(el('#progress').value),
      domains: state.schema.domains
    }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TXDPS_ARB_Submission_${Date.now()}.json`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

function exportHTML(){
  // Simple self-contained report HTML
  const rows = makeFlatRows();
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>TXDPS ARB Report</title>
    <style>body{font-family:Segoe UI,Arial; padding:1rem} h1{font-size:20px} table{border-collapse:collapse;width:100%} td,th{border:1px solid #ddd;padding:6px}</style>
    </head><body><h1>TXDPS ARB Submission Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <h2>Summary</h2>
    <ul>
      <li>Completion: ${el('#progress').value}%</li>
      <li>Attachments: ${state.attachments.length}</li>
    </ul>
    <h2>Answers</h2>
    <table><thead><tr>${Object.keys(rows[0]).map(h=>'<th>'+h+'</th>').join('')}</tr></thead>
    <tbody>${rows.map(r=>'<tr>'+Object.values(r).map(v=>'<td>'+String(v||'')+'</td>').join('')+'</tr>').join('')}</tbody></table>
    </body></html>`;
  const blob = new Blob([html], {type:'text/html'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TXDPS_ARB_Report_${Date.now()}.html`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
}

function updateDashboard(){ updateProgress(); }

window.addEventListener('DOMContentLoaded', init);
