import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Themixa - Gestão Jurídica Inteligente',
        short_name: 'Themixa',
        description: 'Sistema completo para gestão de escritórios jurídicos. Controle de prazos, processos, clientes e finanças.',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#f8fafc',
        theme_color: '#0f172a',
        orientation: 'portrait-primary',
        categories: ['business', 'productivity', 'utilities'],
        lang: 'pt-BR',
        icons: [
            {
                src: '/icon-light-32x32.png',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: '/apple-icon.png',
                sizes: '180x180',
                type: 'image/png',
            },
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
        ],
    }
}
