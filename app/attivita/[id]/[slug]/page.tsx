import { Metadata } from 'next';
import { fetchActivities } from '../../../../src/data/db';
import ActivityDetailPanel from '../../../../src/components/ActivityDetailPanel';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string; slug: string }>
}

export async function generateStaticParams() {
  const activities = await fetchActivities();
  return activities.map((activity) => ({
    id: String(activity.id),
    slug: activity.slug || 'dettaglio',
  }));
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

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leisure-map-zhso.vercel.app';

  return {
    title: `${activity.name} | Leisure Map`,
    description: activity.description || `Scopri ${activity.name} a ${activity.locationName}.`,
    openGraph: {
      title: `${activity.name} - Leisure Map`,
      description: activity.description || `Dettagli su ${activity.name} a ${activity.locationName}.`,
      url: `${SITE_URL}/attivita/${activity.id}/${activity.slug}`,
      type: 'website',
      locale: 'it_IT',
      images: [
        {
          url: `${SITE_URL}/og-default.png`,
          width: 1200,
          height: 630,
          alt: activity.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${activity.name} - Leisure Map`,
      description: activity.description || `Dettagli su ${activity.name} a ${activity.locationName}.`,
      images: [`${SITE_URL}/og-default.png`],
    },
  }
}

export default async function ActivityPage({ params }: Props) {
  const resolvedParams = await params;
  const activities = await fetchActivities();
  const activity = activities.find(a => String(a.id) === resolvedParams.id);

  if (!activity) {
    // Redirect verso la Home evitando 404
    redirect('/');
  }

  if (activity.slug && activity.slug !== resolvedParams.slug) {
    redirect(`/attivita/${activity.id}/${activity.slug}`);
  }

  // Genera JSON-LD (schema.org)
  const isCourse = ['nuoto', 'basket', 'karate', 'danza', 'yoga', 'pilates', 'teatro'].includes(activity.category);
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': isCourse ? 'Course' : 'SportsActivityLocation',
    name: activity.name,
    description: activity.description || `Scopri ${activity.name} a ${activity.locationName}.`,
    provider: {
      '@type': 'Organization',
      name: activity.organizer || activity.locationName,
    },
    location: {
      '@type': 'Place',
      name: activity.locationName,
      address: activity.address,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: activity.lat,
        longitude: activity.lng,
      }
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'var(--surface)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Riusiamo il pannello dettaglio */}
      <ActivityDetailPanel activity={activity} />
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
