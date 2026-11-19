// Neon Palm — audit numbers, computed from the loaded data (never hard-coded).
export function auditNumbers(trophies) {
  const grades = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let steps = 0, cited = 0, guidesCited = 0;
  for (const t of trophies) {
    grades[t.grade] = (grades[t.grade] || 0) + 1;
    if (t.guide.length) {
      const allCited = t.guide.every((s) => /\[\d+\]\s*$/.test(s.trim()));
      if (allCited) guidesCited += 1;
      for (const s of t.guide) {
        steps += 1;
        if (/\[\d+\]\s*$/.test(s.trim())) cited += 1;
      }
    }
  }
  const count = (flag) => trophies.filter((t) => t.flags.includes(flag)).length;
  return {
    total: trophies.length, grades,
    hidden: trophies.filter((t) => t.hidden).length,
    guidesCited, steps, cited,
    missable: count('missable'), watch: count('watch'),
    unconfirmed: count('unconfirmed'), single: count('single'),
    disagree: count('disagree'),
    green: trophies.filter((t) => t.trust === 'green').length,
    amber: trophies.filter((t) => t.trust === 'amber').length,
  };
}
