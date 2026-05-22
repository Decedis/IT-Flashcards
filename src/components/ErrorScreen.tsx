interface ErrorScreenProps {
  onRetry: () => void
}

export function ErrorScreen({ onRetry }: ErrorScreenProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 13, color: 'var(--bad)', fontFamily: 'var(--mono)' }}>
        // error: failed to connect to api
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
        make sure the Hono server is running on :3001
      </div>
      <button
        onClick={onRetry}
        style={{
          marginTop: 8, background: 'var(--accent)', color: 'var(--bg-0)',
          padding: '8px 16px', borderRadius: 'var(--radius)',
          fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 12,
          border: 'none', cursor: 'pointer',
        }}
      >
        › retry
      </button>
    </div>
  )
}
