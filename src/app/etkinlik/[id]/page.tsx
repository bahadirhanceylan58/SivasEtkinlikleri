import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import EventDetailClient from './EventDetailClient';

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { id } = await params;

    if (!id) {
        return {
            title: 'Etkinlik Bulunamadı - Sivas Etkinlikleri'
        }
    }

    try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const event = docSnap.data();
            return {
                title: `${event.title} - Sivas Etkinlikleri`,
                description: event.description ? event.description.substring(0, 160) + '...' : 'Sivas Etkinlikleri detay sayfası',
                openGraph: {
                    title: event.title,
                    description: event.description ? event.description.substring(0, 160) + '...' : undefined,
                    images: [event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'],
                    type: 'website',
                },
                twitter: {
                    card: 'summary_large_image',
                    title: event.title,
                    description: event.description ? event.description.substring(0, 160) + '...' : undefined,
                    images: [event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'],
                }
            }
        }
    } catch (error) {
        console.error("Metadata generation error:", error);
    }

    return {
        title: 'Etkinlik Detayı - Sivas Etkinlikleri',
    }
}

export default function Page() {
    return <EventDetailClient />
}