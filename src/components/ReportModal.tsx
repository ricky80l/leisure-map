import React, { useState } from 'react';

interface ReportModalProps {
  onClose: () => void;
}

export default function ReportModal({ onClose }: ReportModalProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    formData.append('verificato_il', formattedDate);

    try {
      const response = await fetch('https://formspree.io/f/xnjklzaj', { // Real formspree ID
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', padding: '32px', borderRadius: '16px',
        width: '100%', maxWidth: '500px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: 'var(--text)' }}>Segnala nuova struttura</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" style={{ marginBottom: 16 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h3>Grazie per la segnalazione!</h3>
            <p style={{ color: 'var(--muted)' }}>Valuteremo la struttura e la aggiungeremo alla mappa al più presto.</p>
            <button onClick={onClose} className="btn-primary" style={{ marginTop: 24, padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Chiudi</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>Nome della struttura *</label>
              <input type="text" name="nome_struttura" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' }} />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>Categoria/Sport *</label>
                <input type="text" name="categoria" required placeholder="es. Padel, Yoga, Calcio..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>Città/Indirizzo *</label>
                <input type="text" name="indirizzo" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>Link Ufficiale / Contatti</label>
              <input type="text" name="link" placeholder="Sito web, pagina Instagram..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: '14px', fontWeight: 'bold' }}>Note aggiuntive</label>
              <textarea name="note" rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)' }}></textarea>
            </div>
            
            {status === 'error' && (
              <div style={{ color: 'red', fontSize: '14px' }}>Errore durante l'invio. Riprova più tardi.</div>
            )}
            
            <button type="submit" disabled={status === 'loading'} style={{
              background: 'var(--primary)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px',
              fontSize: '16px', fontWeight: 'bold', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              marginTop: '8px', opacity: status === 'loading' ? 0.7 : 1
            }}>
              {status === 'loading' ? 'Invio in corso...' : 'Invia Segnalazione'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
