import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const BASE_URL = 'https://sivasetkinlikleri.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes = [
        '',
        '/hakkimizda',
        '/iletisim',
        '/takvim',
        '/kulupler',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    let eventsRoutes: any[] = [];

    try {
        const querySnapshot = await getDocs(collection(db, 'events'));
        eventsRoutes = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                url: `${BASE_URL}/etkinlik/${doc.id}`,
                lastModified: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            };
        });
    } catch (error) {
        console.error("Sitemap error:", error);
    }

    return [...staticRoutes, ...eventsRoutes];
}
