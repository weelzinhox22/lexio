import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://themixa.com.br'
    const now = new Date()

    return [
        {
            url: baseUrl,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/auth/login`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/auth/sign-up`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/lgpd`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/cookies`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.2,
        },
    ]
}
