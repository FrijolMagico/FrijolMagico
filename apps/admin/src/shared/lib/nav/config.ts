import {
  IconCardsFilled,
  IconConfettiFilled,
  IconDropletsFilled,
  IconFileMusicFilled,
  IconHomeFilled,
  IconLeafFilled,
  IconPaletteFilled,
  IconTicketFilled,
  IconUsersGroup
} from '@tabler/icons-react'

export const navigation = {
  general: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: IconHomeFilled
    },
    {
      title: 'Organización',
      url: '/organizacion',
      icon: IconLeafFilled
    }
  ],
  artistas: [
    {
      title: 'Todxs',
      icon: IconPaletteFilled,
      url: '/artistas'
    },
    {
      title: 'Catálogo',
      icon: IconCardsFilled,
      url: '/artistas/catalogo'
    },
    {
      title: 'Agrupaciones',
      icon: IconUsersGroup,
      url: '/artistas/agrupaciones'
    },
    {
      title: 'Bandas',
      icon: IconFileMusicFilled,
      url: '/artistas/bandas'
    }
  ],
  eventos: [
    {
      title: 'Eventos',
      icon: IconConfettiFilled,
      url: '/eventos'
    },
    {
      title: 'Ediciones',
      icon: IconTicketFilled,
      url: '/eventos/ediciones'
    },
    {
      title: 'Participaciones',
      icon: IconDropletsFilled,
      url: '/eventos/participaciones'
    }
  ]
}
