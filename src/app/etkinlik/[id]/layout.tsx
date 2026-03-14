import { Metadata } from 'next';
import { getAdminDb } from '@/lib/firebaseAdmin';

const BASE_URL = 'https://sivasetkinlikleri.vercel.app';

async function getEvent(id: string) {
    try {
        const adminDb = await getAdminDb();
        const docSnap = await adminDb.collection('events').doc(id).get();
        if (!docSnap.exists) return null;
        return { id: docSnap.id, ...docSnap.data() } as any;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        return { title: 'Etkinlik Bulunamadı' };
    }

    const title = event.title;
    const description = event.description?.substring(0, 160) || `${title} - Sivas Etkinlikleri`;
    const image = event.imageUrl || '/icon-512x512.png';
    const url = `${BASE_URL}/etkinlik/${id}`;

    return {
        title,
        description,
        openGraph: {
            type: 'website',
            url,
            title,
            description,
            images: [{ url: image, alt: title }],
            locale: 'tr_TR',
            siteName: 'Sivas Etkinlikleri',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
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
    const event = await getEvent(id);

    const jsonLd = event ? {
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
        image: event.imageUrl ? [event.imageUrl] : undefined,
        offers: {
            '@type': 'Offer',
            price: event.ticketTypes?.[0]?.price || 0,
            priceCurrency: 'TRY',
            availability: 'https://schema.org/InStock',
            url: `${BASE_URL}/etkinlik/${id}`,
        },
    } : {};

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026') }}
            />
            {children}
        </>
    );
}
