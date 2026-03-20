import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://themixa.com.br'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/api/',
                    '/auth/',
                    '/onboarding/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
