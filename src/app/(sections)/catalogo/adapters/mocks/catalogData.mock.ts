import {
  getRandomName,
  getRandomInstagram,
} from '@/infra/__mocks__/mockDataUtils'

import type { CatalogArtist } from '../../types/catalog'

const quantitys: number[] = [30, 10, 10]

export const getDataFromCatalogMock = (): CatalogArtist[] => {
  return [
    ...Array.from({ length: quantitys[0] }).map((_, i) => ({
      id: (i + 1).toString(),
      name: getRandomName(),
      slug: `artista-${i + 1}`,
      category: 'Ilustracion' as const,
      rrss: `${getRandomInstagram()}?param=${i + 1}`,
      avatar: 'placeholder-avatar.svg',
      bio: `Disenadora grafica con "amplia experiencia" en branding y diseno editorial. Apasionada por la tipografia y el diseno "limpio" y funcional.
      @testing ${i + 1} some other text`,
      email: `maria.gonzalez${i + 1}@ejemplo.com`,
      city: 'La Serena',
      country: 'Chile',
      orden: (i + 1).toString().padStart(3, '0'),
      destacado: i < 5,
      collective: i % 3 === 0 ? `Colectivo ${Math.ceil((i + 1) / 3)}` : null,
      collectives:
        i % 3 === 0
          ? [
              {
                name: `Colectivo ${Math.ceil((i + 1) / 3)}`,
                edicion: 'XV',
                evento: 'Festival Frijol Magico',
              },
            ]
          : [],
      editions: [
        {
          edicion: 'XV',
          evento: 'Festival Frijol Magico',
          año: '2025',
        },
      ],
    })),
    ...Array.from({ length: quantitys[1] }).map((_, i) => ({
      id: (i + quantitys[0] + 1).toString(),
      name: getRandomName(),
      slug: `artista-${i + quantitys[0] + 1}`,
      category: 'Narrativa Grafica' as const,
      rrss: `${getRandomInstagram()}?param=${i + 1}`,
      avatar: 'placeholder-avatar.svg',
      bio: `Disenadora grafica con amplia experiencia en branding y diseno editorial. Apasionada por la tipografia y el diseno limpio y funcional. ${i + 1}`,
      email: `ana.rojas${i + 1}@ejemplo.com`,
      city: 'Coquimbo',
      country: 'Argentina',
      orden: (i + quantitys[0] + 1).toString().padStart(3, '0'),
      destacado: false,
      collective: null,
      collectives: [],
      editions: [
        {
          edicion: 'XIV',
          evento: 'Festival Frijol Magico',
          año: '2024',
        },
      ],
    })),
    ...Array.from({ length: quantitys[2] }).map((_, i) => ({
      id: (i + quantitys[0] + quantitys[1] + 1).toString(),
      name: getRandomName(),
      slug: `artista-${i + quantitys[0] + quantitys[1] + 1}`,
      category: 'Manualidades' as const,
      rrss: `${getRandomInstagram()}?param=${i + 1}`,
      avatar: 'placeholder-avatar.svg',
      bio: `Disenadora grafica con amplia experiencia en branding y diseno editorial. Apasionada por la tipografia y el diseno limpio y funcional. ${i + 1}`,
      email: `lucas.parra${i + 1}@ejemplo.com`,
      city: 'Ovalle',
      country: 'Espana',
      orden: (i + quantitys[0] + quantitys[1] + 1).toString().padStart(3, '0'),
      destacado: false,
      collective: null,
      collectives: [],
      editions: [
        {
          edicion: 'XIII',
          evento: 'Festival Frijol Magico',
          año: '2023',
        },
        {
          edicion: 'XIV',
          evento: 'Festival Frijol Magico',
          año: '2024',
        },
      ],
    })),
  ].sort(() => Math.random() - 0.5)
}
