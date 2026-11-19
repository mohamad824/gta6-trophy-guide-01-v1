// Neon Palm — bootstrap: loads data, renders the audit strip, routes views,
// and wires header Export / Import / spoiler controls.
import { loadData } from './data.js';
import { state, loadState, saveState, exportState, importState } from './state.js';
import { auditNumbers } from './audit.js';
import { renderCover, select } from './guide.js';
import { renderRoadmap, renderMissables, renderSources, renderSave } from './views.js';

let env = null;
let toastTimer = null;

export function toast(msg) {
  const t = document.querySelector('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

function renderAudit() {
  const a = auditNumbers(env.trophies);
  document.querySelector('#audit').innerHTML =
    `<span class="stat"><b>55</b> official</span><span class="stat"><b>1P 2G 6S 46B</b></span>` +
    `<span class="stat"><b>${a.hidden}</b> hidden</span>` +
    `<span class="stat"><b>${a.guidesCited}/55</b> guides cite a source</span>` +
    `<span class="stat"><b>${a.cited}/${a.steps}</b> steps cited</span>` +
    `<span class="stat"><b>${env.sources.length}</b> sources · read ${env.readDate}</span>` +
    `<span class="stat">Possibly missable (disputed) <b>${a.missable} vs 2</b></span>` +
    `<span class="stat">Watch <b>${a.watch}</b></span><span class="stat">Unconfirmed <b>${a.unconfirmed}</b></span>` +
    `<span class="stat">Single-source <b>${a.single}</b></span><span class="stat">Disagree <b>${a.disagree}</b></span>` +
    `<span class="stat">Trust <b>${a.green} green · ${a.amber} amber</b></span>` +
    `<span class="stat">Platinum <b>~200 h</b> (PowerPyx) / <b>300+ h</b> (Push Square) · <b>4/10</b></span>`;
}

function currentView() {
  const h = location.hash.replace('#/', '') || 'guide';
  return ['guide', 'roadmap', 'missables', 'sources', 'save'].includes(h) ? h : 'guide';
}

function render() {
  renderAudit();
  const view = currentView();
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === view));
  const el = document.querySelector('#view');
  const toggle = document.querySelector('#spoiler-toggle');
  toggle.checked = state.spoiler;
  toggle.parentElement.lastChild.textContent = state.spoiler ? ' Spoilers on' : ' Spoilers off';
  if (view === 'guide') renderCover(el, env);
  else if (view === 'roadmap') renderRoadmap(el, env);
  else if (view === 'missables') renderMissables(el, env);
  else if (view === 'sources') renderSources(el, env);
  else renderSave(el, env);
}

function doExport() {
  const d = exportState();
  const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'neon-palm-gta6-save.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(`Exported ${d.earned.length} earned · ${Object.keys(d.counters).length + Object.keys(d.extra).length} counters`);
}

function doImport() {
  document.querySelector('#import-file').click();
}

async function boot() {
  const data = await loadData();
  loadState(data.seed);
  env = { ...data, rerender: render, doExport, doImport };
  document.querySelector('#btn-export').addEventListener('click', doExport);
  document.querySelector('#btn-import').addEventListener('click', doImport);
  document.querySelector('#spoiler-toggle').addEventListener('change', (e) => {
    state.spoiler = e.target.checked; saveState(); render();
  });
  document.querySelector('#import-file').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const d = JSON.parse(await f.text());
      const r = importState(d);
      toast(`Imported ${r.earned} earned · ${r.counters} counters`);
    } catch (_) { toast('Import failed — not a Neon Palm save file'); }
    e.target.value = '';
    render();
  });
  window.addEventListener('hashchange', render);
  select(28);
  render();
}

boot();
