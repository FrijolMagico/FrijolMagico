import { Building2, Home, Palette, Settings } from 'lucide-react'

export const navigation = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    title: 'General',
    href: '/general',
    icon: Building2
  },
  {
    title: 'Artistas',
    icon: Palette,
    href: '/artistas',
    items: [
      {
        title: 'Listado',
        href: '/artistas/listado'
      },
      {
        title: 'Catálogo',
        href: '/artistas/catalogo'
      }
    ]
  },
  {
    title: 'Eventos',
    icon: Palette,
    href: '/eventos',
    items: [
      {
        title: 'Listado',
        href: '/eventos'
      },
      {
        title: 'Ediciones',
        href: '/eventos/ediciones'
      }
    ]
  },
  {
    title: 'Configuración',
    icon: Settings,
    href: '/config'
  }
]
