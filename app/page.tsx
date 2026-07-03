import { fetchActivities } from '../src/data/db';
import HomeClient from '../src/components/HomeClient';

export default async function HomePage() {
  const activities = await fetchActivities();

  return (
    <HomeClient initialActivities={activities} />
  );
}
