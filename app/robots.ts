import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/@', '/produk', '/bundle/'],
        disallow: ['/dashboard/', '/admin/', '/api/', '/login', '/register'],
      },
    ],
    sitemap: 'https://xales.id/sitemap.xml',
    host: 'https://xales.id',
  }
}
