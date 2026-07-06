import { Metadata } from 'next';
import { fetchActivities } from '../../../src/data/db';
import HomeClient from '../../../src/components/HomeClient';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

type Props = {
  params: Promise<{ city: string; category: string }>
}

export async function generateStaticParams() {
  const activities = await fetchActivities();
  const combos = new Set<string>();
  
  activities.forEach(a => {
    if (a.locationName && a.category) {
      combos.add(`${slugify(a.locationName)}|${slugify(a.category)}`);
    }
  });

  return Array.from(combos).map(combo => {
    const [city, category] = combo.split('|');
    return { city, category };
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const activities = await fetchActivities();
  
  const cityMatch = activities.find(a => slugify(a.locationName) === resolvedParams.city);
  const cityName = cityMatch ? cityMatch.locationName : resolvedParams.city;

  const catMatch = activities.find(a => slugify(a.category) === resolvedParams.category);
  const categoryName = catMatch ? catMatch.category : resolvedParams.category;
  
  // Formattazione maiuscola del primo carattere per la categoria
  const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  const title = `Corsi di ${formattedCategory} a ${cityName} | Leisure Map`;
  const description = `Esplora i migliori corsi di ${categoryName} a ${cityName}. Orari, palestre e contatti su Leisure Map.`;

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

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const activities = await fetchActivities();
  
  const cityMatch = activities.find(a => slugify(a.locationName) === resolvedParams.city);
  const cityName = cityMatch ? cityMatch.locationName : resolvedParams.city;

  const catMatch = activities.find(a => slugify(a.category) === resolvedParams.category);
  const categoryName = catMatch ? catMatch.category : resolvedParams.category;

  return <HomeClient initialActivities={activities} initialCity={cityName} initialCategory={categoryName} />;
}
