import { MetadataRoute } from 'next';
import { fetchActivities } from '../src/data/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://leisure-map.netlify.app';
  
  const activities = await fetchActivities();

  const activityUrls = activities.map((activity) => ({
    url: `${baseUrl}/activity/${activity.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...activityUrls,
  ];
}
