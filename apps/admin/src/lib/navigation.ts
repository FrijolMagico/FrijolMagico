import {
  IconCardsFilled,
  IconConfettiFilled,
  IconDropletsFilled,
  IconHomeFilled,
  IconLeafFilled,
  IconPaletteFilled,
  IconTicketFilled
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
