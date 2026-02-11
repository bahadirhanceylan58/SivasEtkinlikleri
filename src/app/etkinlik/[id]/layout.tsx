import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        return {
            title: 'Etkinlik Bulunamadı | Sivas Etkinlikleri'
        };
    }

    const event = docSnap.data();
    return {
        title: `${event.title} - Sivas Etkinlikleri`,
        description: `${event.description?.substring(0, 160)}...`,
        openGraph: {
            images: [event.imageUrl || '/default-event.jpg'],
        },
    };
}

export default async function EventLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const docRef = doc(db, 'events', id);
    const docSnap = await getDoc(docRef);
    let jsonLd = {};

    if (docSnap.exists()) {
        const event = docSnap.data();
        jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: event.title,
            description: event.description,
            startDate: event.date,
            endDate: event.date,
            eventStatus: 'https://schema.org/EventScheduled',
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            location: {
                '@type': 'Place',
                name: event.location,
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Sivas',
                    addressCountry: 'TR',
                },
            },
            image: [event.imageUrl],
            offers: {
                '@type': 'Offer',
                price: event.ticketTypes?.[0]?.price || 0,
                priceCurrency: 'TRY',
                availability: 'https://schema.org/InStock',
                url: `https://sivasetkinlikleri.vercel.app/etkinlik/${id}`,
            },
        };
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {children}
        </>
    );
}
