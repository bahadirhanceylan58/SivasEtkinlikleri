import { MetadataRoute } from 'next';
import { getAdminDb } from '@/lib/firebaseAdmin';

const BASE_URL = 'https://sivasetkinlikleri.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: BASE_URL, priority: 1.0, changeFrequency: 'daily' },
        { url: `${BASE_URL}/etkinlikler`, priority: 0.9, changeFrequency: 'daily' },
        { url: `${BASE_URL}/kurslar`, priority: 0.8, changeFrequency: 'weekly' },
        { url: `${BASE_URL}/kulupler`, priority: 0.8, changeFrequency: 'weekly' },
        { url: `${BASE_URL}/takvim`, priority: 0.7, changeFrequency: 'daily' },
        { url: `${BASE_URL}/mekanlar`, priority: 0.6, changeFrequency: 'weekly' },
        { url: `${BASE_URL}/hakkimizda`, priority: 0.5, changeFrequency: 'monthly' },
        { url: `${BASE_URL}/iletisim`, priority: 0.5, changeFrequency: 'monthly' },
    ].map((r) => ({ ...r, lastModified: new Date() }));

    let eventRoutes: MetadataRoute.Sitemap = [];
    let clubRoutes: MetadataRoute.Sitemap = [];

    try {
        const adminDb = await getAdminDb();
        const [eventsSnap, clubsSnap] = await Promise.all([
            adminDb.collection('events').where('status', '==', 'approved').get(),
            adminDb.collection('clubs').where('status', '==', 'approved').get(),
        ]);

        eventRoutes = eventsSnap.docs.map((doc) => ({
            url: `${BASE_URL}/etkinlik/${doc.id}`,
            lastModified: doc.data().updatedAt?.toDate?.() || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        clubRoutes = clubsSnap.docs.map((doc) => ({
            url: `${BASE_URL}/kulupler/${doc.id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error('Sitemap error:', error);
    }

    return [...staticRoutes, ...eventRoutes, ...clubRoutes];
}
