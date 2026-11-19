// Neon Palm — cover view: checklist (left), guide pane (centre), sources (right).
import { state, saveState } from './state.js';
import { citedBy } from './data.js';

export const filters = { kind: 'all', grade: 'all', q: '', unearnedOnly: false };
export let selectedId = 28; // Positive Mental Attitude — the disputed meditation trophy
export function select(id) { selectedId = id; }

const KIND_LABELS = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
  activities: 'Activities', side: 'Side', crime: 'Crime', money: 'Money',
  watch: 'Watch', unconfirmed: 'Unconfirmed', disagree: 'Disagree' };

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function gradeBadge(t) { return `<span class="grade ${t.grade}">${t.grade[0].toUpperCase()}</span>`; }
function isHidden(t) { return state.spoiler && t.kind.includes('story') && !state.earned.has(t.id) && !state.revealed.has(t.id); }

function flagBadges(t) {
  let out = '';
  if (t.flags.includes('missable')) out += '<span class="badge missable">Possibly missable</span>';
  if (t.flags.includes('watch')) out += '<span class="badge watch">WATCH / May be missable</span>';
  if (t.flags.includes('unconfirmed')) out += '<span class="badge unconfirmed">Trigger not known / unconfirmed</span>';
  if (t.flags.includes('single')) out += '<span class="badge single">Single-source</span>';
  if (t.flags.includes('disagree')) out += '<span class="badge disagree">Sources disagree</span>';
  out += `<span class="badge trust-${t.trust}">Trust: ${t.trust}</span>`;
  return out;
}

function counterBox(t) {
  if (!t.counter) return '';
  const v = state.counters[t.id] || 0;
  return `<div class="counterbox"><div><div class="num"><span id="counter-val">${v}</span> / ${t.counter.target}</div>
    <div class="tmeta">${esc(t.counter.label)}</div></div>
    <button type="button" data-counter="-1" aria-label="decrease">−</button>
    <button type="button" data-counter="1" aria-label="increase">+</button></div>`;
}

function guidePane(t, trophies, sources) {
  if (isHidden(t)) {
    return `<h2 class="guide-title">Hidden trophy</h2>
      <div class="hiddenbox"><p><b>Hidden trophy — hidden until earned</b></p>
      <p>Name, description and guide are hidden while spoilers are off for unearned story trophies.</p>
      <p>Grade: ${gradeBadge(t)} &nbsp;·&nbsp; Roadmap stage: S${t.stage}</p>
      <button type="button" data-reveal="${t.id}">Reveal</button></div>`;
  }
  let dispute = '';
  if (t.id === 28) {
    dispute = `<div class="dispute"><h3>Sources disagree — both versions shown</h3>
      <p><b>Version A — 18 meditations:</b> the trophy needs every spot, all 18. <b>Version B — 15 meditations:</b> the trophy needs 15, the same count the 100% checklist needs.</p>
      <p><b>Does the Chapter 1 balcony count?</b> PowerPyx did it and the trophy popped but wrote “pending confirmation”; OutputLag states it counts; eGamers reports the walkthrough author was not sure; Push Square lists no missable at all.</p></div>
      <div class="safeplay"><h3>Safe play</h3><p>Do the balcony meditation in Chapter 1 and keep a manual Chapter 1 save until the trophy pops.</p></div>`;
  }
  const steps = t.guide.map((s) => `<li>${esc(s)}</li>`).join('');
  const srcs = t.sources.map((n) => `[${n}] ${esc(sources.find((x) => x.n === n)?.name || '')}`).join('<br>');
  return `<h2 class="guide-title">${esc(t.name)}</h2>
    <p class="guide-desc">${esc(t.description)}</p>
    <p>${gradeBadge(t)} <span class="tmeta">Stage S${t.stage} · ${t.kind.map((k) => KIND_LABELS[k]).join(' · ')}</span></p>
    <p>${flagBadges(t)}</p>${dispute}${counterBox(t)}
    <ol class="steps">${steps}</ol>
    <p class="tmeta">Sources for this guide:<br>${srcs}</p>`;
}

export function renderCover(el, env) {
  const { trophies, sources } = env;
  const earned = state.earned.size;
  const chips = ['all', ...Object.keys(KIND_LABELS)].map((k) => {
    const n = k === 'all' ? trophies.length : trophies.filter((t) => t.kind.includes(k)).length;
    const label = k === 'all' ? `All ${n}` : `${KIND_LABELS[k]} ${n}`;
    return `<button type="button" class="chip ${filters.kind === k ? 'active' : ''}" data-kind="${k}">${label}</button>`;
  }).join('');
  const list = trophies.filter((t) => {
    if (filters.kind !== 'all' && !t.kind.includes(filters.kind)) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.unearnedOnly && state.earned.has(t.id)) return false;
    if (filters.q && !(t.name + ' ' + t.description).toLowerCase().includes(filters.q.toLowerCase())) return false;
    return true;
  });
  const rows = list.map((t) => {
    const hidden = isHidden(t);
    const name = hidden ? 'Hidden trophy — hidden until earned' : esc(t.name);
    const meta = hidden ? `Grade ${t.grade} · Stage S${t.stage}` : `${esc(t.description)} · Stage S${t.stage}`;
    return `<li class="${t.id === selectedId ? 'selected' : ''} ${state.earned.has(t.id) ? 'earned' : ''}" data-tid="${t.id}">
      <input type="checkbox" data-check="${t.id}" ${state.earned.has(t.id) ? 'checked' : ''} aria-label="earned">
      ${gradeBadge(t)}<span><span class="tname">${name}</span><br><span class="tmeta">${meta}</span></span></li>`;
  }).join('');
  const sel = trophies.find((t) => t.id === selectedId) || trophies[27];
  const srcPanel = sources.map((s) => `<div class="srcitem"><span class="srcnum">${s.n}</span><b>${esc(s.name)}</b><br>
    <span class="tmeta">${esc(s.depth)} · Read ${env.readDate} · Cited by ${citedBy(trophies, s.n)}/55</span></div>`).join('');
  el.innerHTML = `<div class="cover">
    <div class="col"><h2>Checklist — ${earned}/55 earned</h2>
      <div class="progressbar"><i style="width:${Math.round(earned / 55 * 100)}%"></i></div>
      <div class="filters" style="margin-top:10px">${chips}</div>
      <div class="searchrow"><input id="q" type="search" placeholder="Search trophies…" value="${esc(filters.q)}">
        <select id="grade-filter"><option value="all">All grades</option>
        ${['platinum', 'gold', 'silver', 'bronze'].map((g) => `<option ${filters.grade === g ? 'selected' : ''} value="${g}">${g}</option>`).join('')}</select></div>
      <label class="checkrow"><input type="checkbox" id="unearned-only" ${filters.unearnedOnly ? 'checked' : ''}> Unearned only</label>
      <ul class="tlist">${rows}</ul></div>
    <div class="col">${guidePane(sel, trophies, sources)}</div>
    <div class="col"><h2>Sources — read 20 Nov 2026</h2>${srcPanel}</div>
  </div>`;

  el.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => { filters.kind = b.dataset.kind; env.rerender(); }));
  el.querySelector('#q').addEventListener('input', (e) => { filters.q = e.target.value; const pos = e.target.selectionStart; renderCover(el, env); const q = el.querySelector('#q'); q.focus(); q.setSelectionRange(pos, pos); });
  el.querySelector('#grade-filter').addEventListener('change', (e) => { filters.grade = e.target.value; env.rerender(); });
  el.querySelector('#unearned-only').addEventListener('change', (e) => { filters.unearnedOnly = e.target.checked; env.rerender(); });
  el.querySelectorAll('[data-check]').forEach((c) => c.addEventListener('change', (e) => {
    e.stopPropagation();
    const id = +c.dataset.check;
    if (c.checked) state.earned.add(id); else state.earned.delete(id);
    saveState(); env.rerender();
  }));
  el.querySelectorAll('[data-tid]').forEach((li) => li.addEventListener('click', (e) => {
    if (e.target.matches('input')) return;
    select(+li.dataset.tid); env.rerender();
  }));
  el.querySelectorAll('[data-counter]').forEach((b) => b.addEventListener('click', () => {
    const t = sel;
    const v = Math.max(0, Math.min(t.counter.target, (state.counters[t.id] || 0) + (+b.dataset.counter)));
    state.counters[t.id] = v; saveState(); env.rerender();
  }));
  const rev = el.querySelector('[data-reveal]');
  if (rev) rev.addEventListener('click', () => { state.revealed.add(+rev.dataset.reveal); saveState(); env.rerender(); });
}
