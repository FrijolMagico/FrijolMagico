import { Bean, Home, Palette, Ticket } from 'lucide-react'

export const navigation = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    title: 'General',
    href: '/general',
    icon: Bean
  },
  {
    title: 'Artistas',
    icon: Palette,
    items: [
      {
        title: 'General',
        href: '/artistas'
      },
      {
        title: 'Catálogo',
        href: '/artistas/catalogo'
      }
    ]
  },
  {
    title: 'Eventos',
    icon: Ticket,
    items: [
      {
        title: 'General',
        href: '/eventos'
      },
      {
        title: 'Ediciones',
        href: '/eventos/ediciones'
      }
    ]
  }
]
