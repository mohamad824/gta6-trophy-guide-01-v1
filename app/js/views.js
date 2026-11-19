// Neon Palm — secondary views: Roadmap, Missables & Watch, Sources, Spoilers & Save.
import { state, saveState, exportState } from './state.js';
import { citedBy } from './data.js';

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function gradeBadge(t) { return `<span class="grade ${t.grade}">${t.grade[0].toUpperCase()}</span>`; }

export function nextUp(trophies) {
  // Earliest unearned trophy in roadmap order; the Chapter 1 meditation
  // comes first because its balcony spot has a Chapter 1 deadline.
  const sorted = [...trophies].sort((a, b) => a.stage - b.stage || a.id - b.id);
  return sorted.find((t) => !state.earned.has(t.id)) || null;
}

export function renderRoadmap(el, env) {
  const { trophies, roadmap } = env;
  const up = nextUp(trophies);
  const stages = roadmap.stages.map((s) => {
    const inStage = trophies.filter((t) => t.stage === s.stage);
    const got = inStage.filter((t) => state.earned.has(t.id)).length;
    return `<div class="stage-card"><h3>S${s.stage} — ${esc(s.title)}</h3>
      <p><b>${got}/${inStage.length} earned</b> · ${esc(s.time)}</p>
      <p class="tmeta">${esc(s.note)}</p>
      <p class="tmeta">${inStage.map((t) => esc(t.name)).join(' · ')}</p></div>`;
  }).join('');
  const p = roadmap.platinum;
  const thresholds = roadmap.thresholds.map((t) => `<li>${esc(t)}</li>`).join('');
  const extra = env.seed.extra_defs.map((c) => {
    const v = state.extra[c.key] || 0;
    return `<div class="counterbox"><div><div class="num"><span>${v}</span> / ${c.target}</div>
      <div class="tmeta">${esc(c.label)}</div></div>
      <button type="button" data-extra="${c.key}|-1">−</button>
      <button type="button" data-extra="${c.key}|1">+</button></div>`;
  }).join('');
  el.innerHTML = `<div class="nextup"><h2>Next up</h2>
    <p>${up ? `<b>${esc(up.name)}</b> — ${esc(up.description)} (Stage S${up.stage}). Start here: the Chapter 1 meditation balcony disappears after Chapter 1, so it outranks everything else.` : 'All 55 earned — platinum is yours.'}</p>
    <p class="tmeta">Platinum summary: ${esc(p.time)} · Difficulty ${esc(p.difficulty)} · ${p.playthroughs} playthrough · ${p.online} online · Mission replay: ${esc(p.mission_replay)}</p></div>
    <div class="panel"><h2>Roadmap — 7 stages to platinum</h2><div class="stage-grid">${stages}</div></div>
    <div class="two-col"><div class="panel"><h2>100% completion thresholds (A Long Road)</h2>
      <p class="tmeta">Agreed by PowerPyx + GTABase. ${esc(roadmap.weights_note)}</p><ul class="steps">${thresholds}</ul></div>
    <div class="panel"><h2>100% side counters</h2>${extra}
      <p class="tmeta">These two counts feed A Long Road, not a single trophy — animals studied and flamingos found.</p></div></div>`;
  el.querySelectorAll('[data-extra]').forEach((b) => b.addEventListener('click', () => {
    const [key, d] = b.dataset.extra.split('|');
    const def = env.seed.extra_defs.find((c) => c.key === key);
    state.extra[key] = Math.max(0, Math.min(def.target, (state.extra[key] || 0) + (+d)));
    saveState(); env.rerender();
  }));
}

export function renderMissables(el, env) {
  const { trophies, sources } = env;
  const group = (title, desc, list) => `<div class="panel"><h2>${title} (${list.length})</h2><p>${desc}</p>
    ${list.map((t) => `<div class="kv"><span>${gradeBadge(t)} <b>${esc(t.name)}</b> — ${esc(t.description)}</span><span class="tmeta">S${t.stage}</span></div>`).join('') || '<p class="tmeta">None.</p>'}</div>`;
  const missable = trophies.filter((t) => t.flags.includes('missable'));
  const watch = trophies.filter((t) => t.flags.includes('watch'));
  const cleared = trophies.filter((t) => !t.flags.includes('missable') && !t.flags.includes('watch'));
  const matrix = `<div class="panel"><h2>Source matrix — trophy × source</h2>
    <p class="tmeta">A ✓ means that source supports this trophy's guide. Empty cells mean no support from that source.</p>
    <div style="overflow:auto"><table class="matrix"><thead><tr><th>Trophy</th>${sources.map((s) => `<th>[${s.n}]</th>`).join('')}</tr></thead>
    <tbody>${trophies.map((t) => `<tr><td>${esc(t.name)}</td>${sources.map((s) => `<td class="${t.sources.includes(s.n) ? 'hit' : ''}">${t.sources.includes(s.n) ? '✓' : ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  el.innerHTML = `<div class="panel"><h2>Possibly missable — disputed, not fact</h2>
    <p>Most sources (PowerPyx, GTABase, KeenGamer) say only <b>1</b> trophy is possibly missable. Some guides list <b>2</b>, adding Catch Me If You Can. This guide shows the count as <b>DISPUTED (1 vs 2)</b>, never as a settled fact.</p></div>
    ${group('Possibly missable (disputed)', 'The meditation trophy: its Chapter 1 balcony spot exists only in Chapter 1, and whether it counts is disputed. Safe play: do it in Chapter 1 and keep a manual Chapter 1 save until it pops.', missable)}
    ${group('Watch / time-sensitive', 'Do these while their window is open; the window itself is disputed.', watch)}
    <div class="panel"><h2>Watch windows &amp; safe play</h2>
    <div class="kv"><span><b>Positive Mental Attitude</b> — window: Chapter 1 (balcony)</span><span>Safe play: meditate in Chapter 1, keep a manual save</span></div>
    <div class="kv"><span><b>Strangers &amp; Freaks</b> — window: Chapter 3 (timed Yago race)</span><span>Safe play: race Yago when the hourglass icon appears</span></div>
    <div class="kv"><span><b>Catch Me If You Can</b> — window: VCIA access, disputed</span><span>Safe play: steal the plane as soon as you can reach VCIA</span></div></div>
    ${group('Cleared — everything else', 'No missable or watch flag on any of these; story trophies are automatic and the rest stay available in free roam.', cleared)}
    ${matrix}`;
}

export function renderSources(el, env) {
  const { trophies, sources, readDate } = env;
  const rows = sources.map((s) => `<tr><td>[${s.n}]</td><td><b>${esc(s.name)}</b><br><span class="tmeta">${esc(s.url)}</span></td>
    <td>${esc(s.depth)}</td><td>${esc(readDate)}</td><td>${citedBy(trophies, s.n)}/55</td><td>${esc(s.note)}</td></tr>`).join('');
  const green = trophies.filter((t) => t.trust === 'green').length;
  const amber = trophies.filter((t) => t.trust === 'amber').length;
  el.innerHTML = `<div class="panel"><h2>Sources — all read ${esc(readDate)}</h2>
    <p>Trust system: <span class="badge trust-green">${green} green</span> <span class="badge trust-amber">${amber} amber</span> — amber means single-source, disputed or unconfirmed. PowerPyx is always [1].</p>
    <table class="srctable"><thead><tr><th>#</th><th>Source</th><th>Read depth</th><th>Read date</th><th>Cited by</th><th>Note</th></tr></thead><tbody>${rows}</tbody></table>
    <p class="tmeta">Hidden count: 28 official (Exophase / PSNProfiles / kit). Push Square marks 27 — the 1-trophy difference is unexplained and noted here, not hidden.</p></div>`;
}

export function renderSave(el, env) {
  const d = exportState();
  const sample = JSON.stringify(d, null, 1).slice(0, 900);
  const demo = env.trophies.find((t) => t.kind.includes('story') && !state.earned.has(t.id) && !state.revealed.has(t.id));
  const preview = demo ? (state.spoiler
    ? `<div class="hiddenbox" style="margin-top:10px"><p><b>Hidden trophy — hidden until earned</b></p>
       <p>Grade: <span class="grade ${demo.grade}">${demo.grade[0].toUpperCase()}</span> · Roadmap stage: S${demo.stage}</p>
       <button type="button" id="demo-reveal">Reveal</button></div>`
    : `<p class="tmeta" style="margin-top:10px">Spoilers are off, so story trophies show normally. Turn them on to see this trophy hidden.</p>`)
    : '<p class="tmeta" style="margin-top:10px">All story trophies are earned or revealed.</p>';
  el.innerHTML = `<div class="two-col">
    <div class="panel"><h2>Spoilers &amp; save</h2>
      <p>Spoiler setting is <b>${state.spoiler ? 'ON' : 'OFF'}</b>. When ON, unearned story trophies show “Hidden trophy — hidden until earned” with a Reveal button; grade and roadmap stage stay visible.</p>
      <p><button type="button" id="save-spoiler">Turn spoilers ${state.spoiler ? 'off' : 'on'}</button></p>
      <p class="tmeta">Progress is saved in this browser (localStorage) after every change. ${state.earned.size}/55 earned · ${Object.keys(state.counters).length + Object.keys(state.extra).length} counters stored.</p>
      <h2 style="margin-top:12px">Spoiler preview — live</h2>${preview}</div>
    <div class="panel"><h2>Export / Import</h2>
      <p><button type="button" id="save-export">Export JSON</button> <button type="button" class="ghost" id="save-import">Import JSON…</button></p>
      <p class="tmeta">Export downloads your earned set and counters as a JSON file. Import reads one back and confirms with a toast.</p>
      <pre class="jsonbox">${esc(sample)}${JSON.stringify(d).length > 900 ? '\n… (truncated preview)' : ''}</pre></div></div>`;
  el.querySelector('#save-spoiler').addEventListener('click', () => {
    state.spoiler = !state.spoiler; saveState(); env.rerender();
  });
  const demoBtn = el.querySelector('#demo-reveal');
  if (demoBtn) demoBtn.addEventListener('click', () => {
    const t = env.trophies.find((x) => x.kind.includes('story') && !state.earned.has(x.id) && !state.revealed.has(x.id));
    if (t) { state.revealed.add(t.id); saveState(); env.rerender(); }
  });
  el.querySelector('#save-export').addEventListener('click', () => env.doExport());
  el.querySelector('#save-import').addEventListener('click', () => env.doImport());
}
