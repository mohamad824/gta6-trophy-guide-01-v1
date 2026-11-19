// Neon Palm — data loading: fetches the bundled JSON files (offline, local only).
export async function loadData() {
  const [t, s, r, seed] = await Promise.all([
    fetch('data/trophies.json').then((x) => x.json()),
    fetch('data/sources.json').then((x) => x.json()),
    fetch('data/roadmap.json').then((x) => x.json()),
    fetch('data/seed.json').then((x) => x.json()),
  ]);
  return { trophies: t.trophies, sources: s.sources, readDate: s.read_date,
           roadmap: r, seed };
}
export function citedBy(trophies, n) {
  return trophies.filter((t) => t.sources.includes(n)).length;
}
