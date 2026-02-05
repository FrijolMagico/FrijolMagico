import {
  Building2,
  Calendar,
  Home,
  Palette,
  Settings,
  Users
} from 'lucide-react'

export const navigation = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    title: 'Organización',
    href: '/organizacion',
    icon: Building2
  },
  {
    title: 'Catálogo',
    icon: Palette,
    href: '/catalogo',
    items: [
      {
        title: 'Artistas',
        href: '/catalogo/artistas'
      },
      {
        title: 'Disciplinas',
        href: '/catalogo/disciplinas'
      }
    ]
  },
  {
    title: 'Eventos',
    icon: Calendar,
    href: '/eventos',
    items: [
      {
        title: 'Festivales',
        href: '/eventos/festivales'
      },
      {
        title: 'Ediciones',
        href: '/eventos/ediciones'
      }
    ]
  },
  {
    title: 'Usuarios',
    href: '/usuarios',
    icon: Users
  },
  {
    title: 'Configuración',
    href: '/configuracion',
    icon: Settings
  }
]
