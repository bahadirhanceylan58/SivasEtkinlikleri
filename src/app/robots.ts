import { MetadataRoute } from 'next';

const BASE_URL = 'https://sivasetkinlikleri.vercel.app';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/profil', '/odeme'],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
