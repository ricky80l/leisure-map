import { Suspense } from 'react';
import { fetchActivities } from '../src/data/db';
import HomeClient from '../src/components/HomeClient';

export default async function HomePage() {
  const activities = await fetchActivities();

  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA', fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1A1A1A', marginBottom: '8px', margin: 0 }}>Leisure Map</h1>
        <p style={{ color: '#666', marginTop: '8px' }}>Caricamento mappa e attività in corso...</p>
        <div style={{ marginTop: '24px', width: '40px', height: '40px', border: '3px solid #E5E7EB', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <HomeClient initialActivities={activities} />
    </Suspense>
  );
}
