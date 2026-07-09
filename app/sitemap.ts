import { MetadataRoute } from 'next';
import { fetchActivities } from '../src/data/db';

function slugify(text: string) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://leisure-map.vercel.app';
  
  const activities = await fetchActivities();

  const activityUrls = activities.map((activity) => ({
    url: `${baseUrl}/attivita/${activity.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const citySet = new Set<string>();
  const cityCategorySet = new Set<string>();

  activities.forEach(a => {
    if (a.locationName) {
      const citySlug = slugify(a.locationName);
      citySet.add(citySlug);
      if (a.category) {
        cityCategorySet.add(`${citySlug}/${slugify(a.category)}`);
      }
    }
  });

  const cityUrls = Array.from(citySet).map(city => ({
    url: `${baseUrl}/${city}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }));

  const categoryUrls = Array.from(cityCategorySet).map(combo => ({
    url: `${baseUrl}/${combo}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...cityUrls,
    ...categoryUrls,
    ...activityUrls,
  ];
}
