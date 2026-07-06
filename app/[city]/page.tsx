import { Metadata } from 'next';
import { fetchActivities } from '../../src/data/db';
import HomeClient from '../../src/components/HomeClient';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

type Props = {
  params: Promise<{ city: string }>
}

export async function generateStaticParams() {
  const activities = await fetchActivities();
  const cities = Array.from(new Set(activities.map(a => a.locationName)));
  return cities.map(city => ({ city: slugify(city) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const activities = await fetchActivities();
  
  // Trova il nome originale della città a partire dallo slug
  const match = activities.find(a => slugify(a.locationName) === resolvedParams.city);
  const cityName = match ? match.locationName : resolvedParams.city;

  const title = `Attività e Corsi a ${cityName} | Leisure Map`;
  const description = `Scopri tutte le attività, i corsi e le palestre disponibili a ${cityName}. Trova il tuo tempo libero su Leisure Map.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    }
  };
}

export default async function CityPage({ params }: Props) {
  const resolvedParams = await params;
  const activities = await fetchActivities();
  const match = activities.find(a => slugify(a.locationName) === resolvedParams.city);
  const cityName = match ? match.locationName : resolvedParams.city;

  return <HomeClient initialActivities={activities} initialCity={cityName} />;
}
