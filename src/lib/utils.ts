export function pickRandom<T extends { id: string }>(arr: T[], n: number, excludeId: string): T[] {
  const pool = arr.filter(x => x.id !== excludeId)
  const out: T[] = []
  const used = new Set<number>()
  while (out.length < n && out.length < pool.length) {
    const idx = Math.floor(Math.random() * pool.length)
    if (!used.has(idx)) { used.add(idx); out.push(pool[idx]) }
  }
  return out
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
