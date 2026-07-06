'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="it">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '20px', textAlign: 'center', background: '#f9fafb', color: '#111827'
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Errore Critico</h2>
          <p style={{ color: '#6b7280', marginBottom: '32px', maxWidth: '500px' }}>
            Si è verificato un errore irreversibile a livello di applicazione.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '12px 24px', background: '#0e7c66', color: 'white',
              border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Riprova a caricare
          </button>
        </div>
      </body>
    </html>
  );
}
