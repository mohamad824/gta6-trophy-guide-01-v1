// Neon Palm — progress state: earned set, counters, spoiler setting, reveals.
// Persisted in localStorage; seeded once from seed.json (14/55 earned).
export const LS_KEY = 'neon-palm-v1';
export const state = {
  earned: new Set(), counters: {}, extra: {}, spoiler: false, revealed: new Set(),
};

export function seedState(seed) {
  state.earned = new Set(seed.earned);
  state.counters = { ...seed.counters };
  state.extra = { ...seed.extra };
  state.spoiler = false;
  state.revealed = new Set();
}

export function loadState(seed) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) { seedState(seed); saveState(); return; }
    const d = JSON.parse(raw);
    state.earned = new Set(d.earned || []);
    state.counters = d.counters || {};
    state.extra = d.extra || {};
    state.spoiler = !!d.spoiler;
    state.revealed = new Set(d.revealed || []);
  } catch (_) { seedState(seed); saveState(); }
}

export function saveState() {
  const d = { earned: [...state.earned], counters: state.counters, extra: state.extra,
              spoiler: state.spoiler, revealed: [...state.revealed] };
  localStorage.setItem(LS_KEY, JSON.stringify(d));
  return d;
}

export function exportState() { return saveState(); }

export function importState(d) {
  if (!d || !Array.isArray(d.earned)) throw new Error('bad save file');
  state.earned = new Set(d.earned.filter((x) => Number.isInteger(x)));
  state.counters = d.counters || {};
  state.extra = d.extra || {};
  if (typeof d.spoiler === 'boolean') state.spoiler = d.spoiler;
  saveState();
  return { earned: state.earned.size,
           counters: Object.keys(state.counters).length + Object.keys(state.extra).length };
}
