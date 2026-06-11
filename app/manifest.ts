import { MetadataRoute } from 'next'
import { propertyConfig } from '@/config/property'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: propertyConfig.name,
    short_name: 'MAX Entertain',
    description:
      'Award-winning beachfront retreat on the Mornington Peninsula. 6 bedrooms, heated pool & spa, sleeps 20+. Book direct & save.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f0d',
    theme_color: '#0f0f0d',
    icons: [
      {
        src: encodeURI('/Airbnb picture/icons_files/Icon.png'),
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
