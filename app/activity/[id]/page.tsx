import { Metadata } from 'next';
import { fetchActivities } from '../../../src/data/db';
import ActivityDetailPanel from '../../../src/components/ActivityDetailPanel';
import Link from 'next/link';

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const activities = await fetchActivities();
  const activity = activities.find(a => String(a.id) === resolvedParams.id);

  if (!activity) {
    return {
      title: 'Attività non trovata - Leisure Map'
    }
  }

  return {
    title: `${activity.name} | Leisure Map`,
    description: activity.description || `Scopri ${activity.name} a ${activity.locationName}.`,
    openGraph: {
      title: `${activity.name} - Leisure Map`,
      description: activity.description || `Dettagli su ${activity.name} a ${activity.locationName}.`,
      images: [
        {
          url: 'https://leisure-map.netlify.app/og-default.png',
          width: 1200,
          height: 630,
          alt: activity.name,
        },
      ],
    },
  }
}

export default async function ActivityPage({ params }: Props) {
  const resolvedParams = await params;
  const activities = await fetchActivities();
  const activity = activities.find(a => String(a.id) === resolvedParams.id);

  if (!activity) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Attività non trovata</h1>
        <Link href="/">Torna alla mappa</Link>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'var(--surface)' }}>
      {/* Riusiamo il pannello dettaglio ma mockiamo onClose per fare un redirect alla home */}
      <ActivityDetailPanel activity={activity} onClose={() => {}} />
      <style>{`
        /* Overrides to make the panel take the full page naturally instead of acting like a modal */
        .panel {
          position: static !important;
          width: 100% !important;
          height: 100% !important;
          box-shadow: none !important;
          border-left: none !important;
        }
        .p-close {
          display: none !important;
        }
      `}</style>
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 100 }}>
        <Link href="/" style={{
          background: 'var(--card)', padding: '10px 16px', borderRadius: '8px', 
          boxShadow: 'var(--shadow)', fontWeight: 600, textDecoration: 'none', color: 'var(--ink)'
        }}>
          ✕ Chiudi e torna alla mappa
        </Link>
      </div>
    </div>
  );
}
