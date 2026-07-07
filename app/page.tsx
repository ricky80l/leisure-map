import { Suspense } from 'react';
import { fetchActivities } from '../src/data/db';
import HomeClient from '../src/components/HomeClient';

export default async function HomePage() {
  const activities = await fetchActivities();

  return (
    <Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Caricamento app...</div>}>
      <HomeClient initialActivities={activities} />
    </Suspense>
  );
}
