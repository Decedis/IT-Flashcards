export function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
        <span style={{ marginRight: 8 }}>$</span>
        <span style={{ color: 'var(--fg-2)' }}>loading flashcard data</span>
        <span style={{ animation: 'blink 1s steps(2) infinite', color: 'var(--accent)' }}>▋</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>fetching terms from api…</div>
    </div>
  )
}
