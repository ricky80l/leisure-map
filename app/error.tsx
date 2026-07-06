'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registra l'errore in console o su un servizio di log
    console.error('App Error:', error);
  }, [error]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '20px', textAlign: 'center', background: 'var(--surface)', color: 'var(--ink)'
    }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Ops, qualcosa è andato storto!</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '32px', maxWidth: '500px' }}>
        Si è verificato un errore imprevisto durante il caricamento della pagina.
        {error.message && <span style={{ display: 'block', marginTop: '8px', fontSize: '0.9rem', opacity: 0.8 }}>Dettagli: {error.message}</span>}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '12px 24px', background: 'var(--primary)', color: 'white',
          border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
          fontSize: '1rem', boxShadow: '0 4px 12px rgba(14, 124, 102, 0.25)'
        }}
      >
        Riprova a caricare
      </button>
    </div>
  );
}
