import { X, Sparkles, CheckCircle, Rocket } from 'lucide-react';
import { LATEST_PATCH_NOTE } from '../data/patchNotes';

interface PatchNotesModalProps {
  onClose: () => void;
}

export default function PatchNotesModal({ onClose }: PatchNotesModalProps) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 3000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div 
        style={{ position: 'absolute', inset: 0, background: 'rgba(26, 34, 51, 0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      
      <div style={{
        background: 'var(--card)', borderRadius: '16px', boxShadow: 'var(--shadow)',
        width: '100%', maxWidth: '520px', position: 'relative', zIndex: 3010,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Header Decorativo */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
          padding: '28px 24px', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-20px', opacity: 0.15, transform: 'rotate(15deg)' }}>
            <Rocket size={140} />
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.75rem', fontWeight: 700, margin: '0 0 8px 0', position: 'relative', zIndex: 10, letterSpacing: '-0.01em' }}>
            {LATEST_PATCH_NOTE.title}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500, position: 'relative', zIndex: 10 }}>
            <span style={{ background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '6px' }}>
              v{LATEST_PATCH_NOTE.version}
            </span>
            <span>•</span>
            <span>{LATEST_PATCH_NOTE.date}</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.15)', color: '#fff',
            borderRadius: '999px', padding: '6px', zIndex: 3020, backdropFilter: 'blur(4px)',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
        >
          <X size={20} />
        </button>

        {/* Contenuto */}
        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '55vh' }}>
          
          {LATEST_PATCH_NOTE.features.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles color="var(--accent)" size={20} />
                Nuove Funzionalità
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {LATEST_PATCH_NOTE.features.map((feature, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '10px', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {LATEST_PATCH_NOTE.fixes.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <CheckCircle color="var(--primary)" size={20} />
                Correzioni e Miglioramenti
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {LATEST_PATCH_NOTE.fixes.map((fix, idx) => (
                  <li key={idx} style={{ display: 'flex', gap: '10px', color: 'var(--muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>•</span>
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)', background: 'var(--surface)', textAlign: 'center' }}>
          <button 
            onClick={onClose}
            style={{
              width: '100%', background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '1rem',
              padding: '12px 24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(14, 124, 102, 0.2)',
              transition: 'all 0.2s', transform: 'scale(1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Ho capito, Inizia a Esplorare!
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
