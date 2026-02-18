import { describe, test, expect } from 'bun:test'
import {
  organizacionSchema,
  organizacionEquipoSchema
} from '@/shared/commit-system/schemas/organizacion.schema'
import { catalogoArtistaSchema } from '@/shared/commit-system/schemas/catalogo.schema'
import {
  artistaSchema,
  artistaImagenSchema
} from '@/shared/commit-system/schemas/artista.schema'
import {
  eventoSchema,
  eventoEdicionSchema,
  eventoEdicionDiaSchema,
  MODALIDAD
} from '@/shared/commit-system/schemas/evento.schema'

describe('organizacionSchema', () => {
  test('valida datos mínimos requeridos', () => {
    const validData = {
      nombre: 'Frijol Mágico'
    }

    const result = organizacionSchema.parse(validData)

    expect(result).toEqual({
      nombre: 'Frijol Mágico'
    })
  })

  test('valida datos completos', () => {
    const validData = {
      id: 1,
      nombre: 'Frijol Mágico',
      descripcion: 'Asociación cultural',
      mision: 'Promover la cultura',
      vision: 'Ser referentes culturales'
    }

    const result = organizacionSchema.parse(validData)

    expect(result).toEqual(validData)
  })

  test('rechaza nombre vacío', () => {
    const invalidData = {
      nombre: ''
    }

    expect(() => organizacionSchema.parse(invalidData)).toThrow()
  })

  test('rechaza nombre faltante', () => {
    const invalidData = {
      descripcion: 'Sin nombre'
    }

    expect(() => organizacionSchema.parse(invalidData)).toThrow()
  })

  test('permite campos opcionales ausentes', () => {
    const validData = {
      nombre: 'Frijol Mágico',
      descripcion: undefined,
      mision: undefined,
      vision: undefined
    }

    const result = organizacionSchema.parse(validData)

    expect(result.descripcion).toBeUndefined()
    expect(result.mision).toBeUndefined()
    expect(result.vision).toBeUndefined()
  })

  test('rechaza id no positivo', () => {
    const invalidData = {
      id: 0,
      nombre: 'Frijol Mágico'
    }

    expect(() => organizacionSchema.parse(invalidData)).toThrow()
  })

  test('rechaza id negativo', () => {
    const invalidData = {
      id: -1,
      nombre: 'Frijol Mágico'
    }

    expect(() => organizacionSchema.parse(invalidData)).toThrow()
  })

  test('rechaza id no entero', () => {
    const invalidData = {
      id: 1.5,
      nombre: 'Frijol Mágico'
    }

    expect(() => organizacionSchema.parse(invalidData)).toThrow()
  })
})

describe('organizacionEquipoSchema', () => {
  test('valida datos mínimos requeridos', () => {
    const validData = {
      organizacionId: 1,
      nombre: 'Juan Pérez'
    }

    const result = organizacionEquipoSchema.parse(validData)

    expect(result).toEqual(validData)
  })

  test('valida datos completos', () => {
    const validData = {
      id: 1,
      organizacionId: 1,
      nombre: 'Juan Pérez',
      cargo: 'Director',
      rrss: 'https://instagram.com/juan'
    }

    const result = organizacionEquipoSchema.parse(validData)

    expect(result).toEqual(validData)
  })

  test('rechaza organizacionId no positivo', () => {
    const invalidData = {
      organizacionId: 0,
      nombre: 'Juan Pérez'
    }

    expect(() => organizacionEquipoSchema.parse(invalidData)).toThrow()
  })

  test('rechaza nombre vacío', () => {
    const invalidData = {
      organizacionId: 1,
      nombre: ''
    }

    expect(() => organizacionEquipoSchema.parse(invalidData)).toThrow()
  })

  test('permite campos opcionales ausentes', () => {
    const validData = {
      organizacionId: 1,
      nombre: 'Juan Pérez',
      cargo: undefined,
      rrss: undefined
    }

    const result = organizacionEquipoSchema.parse(validData)

    expect(result.cargo).toBeUndefined()
    expect(result.rrss).toBeUndefined()
  })
})

describe('catalogoArtistaSchema', () => {
  test('valida datos válidos con defaults', () => {
    const validData = {
      artistaId: 1,
      orden: '001'
    }

    const result = catalogoArtistaSchema.parse(validData)

    expect(result).toEqual({
      artistaId: 1,
      orden: '001',
      destacado: false,
      activo: true
    })
  })

  test('valida datos completos', () => {
    const validData = {
      id: 1,
      artistaId: 5,
      orden: '010',
      destacado: true,
      activo: false,
      descripcion: 'Artista destacado del mes'
    }

    const result = catalogoArtistaSchema.parse(validData)

    expect(result).toEqual(validData)
  })

  test('rechaza artistaId no positivo', () => {
    const invalidData = {
      artistaId: 0,
      orden: '001'
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza artistaId negativo', () => {
    const invalidData = {
      artistaId: -1,
      orden: '001'
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza orden vacío', () => {
    const invalidData = {
      artistaId: 1,
      orden: ''
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza orden faltante', () => {
    const invalidData = {
      artistaId: 1
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza destacado no booleano', () => {
    const invalidData = {
      artistaId: 1,
      orden: '001',
      destacado: 'true' as unknown as boolean
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza activo no booleano', () => {
    const invalidData = {
      artistaId: 1,
      orden: '001',
      activo: 1 as unknown as boolean
    }

    expect(() => catalogoArtistaSchema.parse(invalidData)).toThrow()
  })

  test('permite descripcion opcional', () => {
    const validData = {
      artistaId: 1,
      orden: '001',
      descripcion: undefined
    }

    const result = catalogoArtistaSchema.parse(validData)

    expect(result.descripcion).toBeUndefined()
  })

  test('aplica defaults correctamente', () => {
    const validData = {
      artistaId: 1,
      orden: '001',
      destacado: undefined,
      activo: undefined
    }

    const result = catalogoArtistaSchema.parse(validData)

    expect(result.destacado).toBe(false)
    expect(result.activo).toBe(true)
  })
})

describe('artistaSchema', () => {
  test('valida datos mínimos requeridos', () => {
    const validData = {
      pseudonimo: 'El Artista',
      slug: 'el-artista'
    }

    const result = artistaSchema.parse(validData)

    expect(result).toEqual({
      pseudonimo: 'El Artista',
      slug: 'el-artista',
      estadoId: 1
    })
  })

  test('valida datos completos', () => {
    const validData = {
      id: 1,
      estadoId: 2,
      nombre: 'Juan Pérez',
      pseudonimo: 'El Artista',
      slug: 'el-artista',
      rut: '12345678-9',
      correo: 'juan@example.com',
      rrss: 'https://instagram.com/elartista',
      ciudad: 'Santiago',
      pais: 'Chile'
    }

    const result = artistaSchema.parse(validData)

    expect(result).toEqual(validData)
  })

  test('rechaza pseudonimo vacío', () => {
    const invalidData = {
      pseudonimo: '',
      slug: 'el-artista'
    }

    expect(() => artistaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza slug vacío', () => {
    const invalidData = {
      pseudonimo: 'El Artista',
      slug: ''
    }

    expect(() => artistaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza pseudonimo faltante', () => {
    const invalidData = {
      slug: 'el-artista'
    }

    expect(() => artistaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza slug faltante', () => {
    const invalidData = {
      pseudonimo: 'El Artista'
    }

    expect(() => artistaSchema.parse(invalidData)).toThrow()
  })

  test('aplica estadoId default correctamente', () => {
    const validData = {
      pseudonimo: 'El Artista',
      slug: 'el-artista',
      estadoId: undefined
    }

    const result = artistaSchema.parse(validData)

    expect(result.estadoId).toBe(1)
  })

  test('permite campos opcionales ausentes', () => {
    const validData = {
      pseudonimo: 'El Artista',
      slug: 'el-artista',
      nombre: undefined,
      rut: undefined,
      correo: undefined,
      rrss: undefined,
      ciudad: undefined,
      pais: undefined
    }

    const result = artistaSchema.parse(validData)

    expect(result.nombre).toBeUndefined()
    expect(result.rut).toBeUndefined()
    expect(result.correo).toBeUndefined()
    expect(result.rrss).toBeUndefined()
    expect(result.ciudad).toBeUndefined()
    expect(result.pais).toBeUndefined()
  })

  test('rechaza estadoId no positivo', () => {
    const invalidData = {
      estadoId: 0,
      pseudonimo: 'El Artista',
      slug: 'el-artista'
    }

    expect(() => artistaSchema.parse(invalidData)).toThrow()
  })
})

describe('artistaImagenSchema', () => {
  test('valida datos mínimos requeridos', () => {
    const validData = {
      artistaId: 1,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'avatar' as const
    }

    const result = artistaImagenSchema.parse(validData)

    expect(result).toEqual({
      artistaId: 1,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'avatar',
      orden: 1
    })
  })

  test('valida datos completos', () => {
    const validData = {
      id: 1,
      artistaId: 5,
      imagenUrl: 'https://example.com/gallery.jpg',
      tipo: 'galeria' as const,
      orden: 3,
      metadata: '{"alt": "Foto en concierto"}'
    }

    const result = artistaImagenSchema.parse(validData)

    expect(result).toEqual(validData)
  })

  test('rechaza artistaId no positivo', () => {
    const invalidData = {
      artistaId: 0,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'avatar' as const
    }

    expect(() => artistaImagenSchema.parse(invalidData)).toThrow()
  })

  test('rechaza imagenUrl vacía', () => {
    const invalidData = {
      artistaId: 1,
      imagenUrl: '',
      tipo: 'avatar' as const
    }

    expect(() => artistaImagenSchema.parse(invalidData)).toThrow()
  })

  test('rechaza tipo inválido', () => {
    const invalidData = {
      artistaId: 1,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'banner' as unknown as 'avatar'
    }

    expect(() => artistaImagenSchema.parse(invalidData)).toThrow()
  })

  test('acepta tipo avatar', () => {
    const validData = {
      artistaId: 1,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'avatar' as const
    }

    const result = artistaImagenSchema.parse(validData)

    expect(result.tipo).toBe('avatar')
  })

  test('acepta tipo galeria', () => {
    const validData = {
      artistaId: 1,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'galeria' as const
    }

    const result = artistaImagenSchema.parse(validData)

    expect(result.tipo).toBe('galeria')
  })

  test('aplica orden default correctamente', () => {
    const validData = {
      artistaId: 1,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'avatar' as const,
      orden: undefined
    }

    const result = artistaImagenSchema.parse(validData)

    expect(result.orden).toBe(1)
  })

  test('rechaza orden no positivo', () => {
    const invalidData = {
      artistaId: 1,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'avatar' as const,
      orden: 0
    }

    expect(() => artistaImagenSchema.parse(invalidData)).toThrow()
  })

  test('permite metadata opcional', () => {
    const validData = {
      artistaId: 1,
      imagenUrl: 'https://example.com/image.jpg',
      tipo: 'avatar' as const,
      metadata: undefined
    }

    const result = artistaImagenSchema.parse(validData)

    expect(result.metadata).toBeUndefined()
  })
})

describe('eventoSchema', () => {
  test('valida datos mínimos requeridos', () => {
    const validData = {
      nombre: 'Festival de Arte'
    }

    const result = eventoSchema.parse(validData)

    expect(result).toEqual({
      nombre: 'Festival de Arte'
    })
  })

  test('valida datos completos', () => {
    const validData = {
      id: 1,
      organizacionId: 1,
      nombre: 'Festival de Arte',
      slug: 'festival-de-arte',
      descripcion: 'Un evento cultural'
    }

    const result = eventoSchema.parse(validData)

    expect(result).toEqual(validData)
  })

  test('rechaza nombre vacío', () => {
    const invalidData = {
      nombre: ''
    }

    expect(() => eventoSchema.parse(invalidData)).toThrow()
  })

  test('rechaza nombre faltante', () => {
    const invalidData = {
      slug: 'festival'
    }

    expect(() => eventoSchema.parse(invalidData)).toThrow()
  })

  test('permite campos opcionales ausentes', () => {
    const validData = {
      nombre: 'Festival de Arte',
      organizacionId: undefined,
      slug: undefined,
      descripcion: undefined
    }

    const result = eventoSchema.parse(validData)

    expect(result.organizacionId).toBeUndefined()
    expect(result.slug).toBeUndefined()
    expect(result.descripcion).toBeUndefined()
  })

  test('rechaza id no positivo', () => {
    const invalidData = {
      id: 0,
      nombre: 'Festival de Arte'
    }

    expect(() => eventoSchema.parse(invalidData)).toThrow()
  })

  test('rechaza organizacionId no positivo', () => {
    const invalidData = {
      organizacionId: -1,
      nombre: 'Festival de Arte'
    }

    expect(() => eventoSchema.parse(invalidData)).toThrow()
  })
})

describe('eventoEdicionSchema', () => {
  test('valida datos mínimos requeridos', () => {
    const validData = {
      numeroEdicion: '2024'
    }

    const result = eventoEdicionSchema.parse(validData)

    expect(result).toEqual({
      numeroEdicion: '2024'
    })
  })

  test('valida datos completos', () => {
    const validData = {
      id: 1,
      eventoId: 1,
      nombre: 'Festival de Arte 2024',
      numeroEdicion: '2024',
      slug: 'festival-arte-2024',
      posterUrl: 'https://example.com/poster.jpg'
    }

    const result = eventoEdicionSchema.parse(validData)

    expect(result).toEqual(validData)
  })

  test('rechaza numeroEdicion vacío', () => {
    const invalidData = {
      numeroEdicion: ''
    }

    expect(() => eventoEdicionSchema.parse(invalidData)).toThrow()
  })

  test('rechaza numeroEdicion faltante', () => {
    const invalidData = {
      nombre: 'Festival 2024'
    }

    expect(() => eventoEdicionSchema.parse(invalidData)).toThrow()
  })

  test('permite campos opcionales ausentes', () => {
    const validData = {
      numeroEdicion: '2024',
      eventoId: undefined,
      nombre: undefined,
      slug: undefined,
      posterUrl: undefined
    }

    const result = eventoEdicionSchema.parse(validData)

    expect(result.eventoId).toBeUndefined()
    expect(result.nombre).toBeUndefined()
    expect(result.slug).toBeUndefined()
    expect(result.posterUrl).toBeUndefined()
  })

  test('rechaza id no positivo', () => {
    const invalidData = {
      id: 0,
      numeroEdicion: '2024'
    }

    expect(() => eventoEdicionSchema.parse(invalidData)).toThrow()
  })

  test('rechaza eventoId no positivo', () => {
    const invalidData = {
      eventoId: -1,
      numeroEdicion: '2024'
    }

    expect(() => eventoEdicionSchema.parse(invalidData)).toThrow()
  })
})

describe('eventoEdicionDiaSchema', () => {
  test('valida datos mínimos requeridos', () => {
    const validData = {
      eventoEdicionId: 1,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: '23:00'
    }

    const result = eventoEdicionDiaSchema.parse(validData)

    expect(result).toEqual({
      eventoEdicionId: 1,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: '23:00',
      modalidad: 'presencial'
    })
  })

  test('valida datos completos', () => {
    const validData = {
      id: 1,
      eventoEdicionId: 1,
      lugarId: 5,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: '23:00',
      modalidad: 'hibrido' as const
    }

    const result = eventoEdicionDiaSchema.parse(validData)

    expect(result).toEqual(validData)
  })

  test('rechaza eventoEdicionId no positivo', () => {
    const invalidData = {
      eventoEdicionId: 0,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: '23:00'
    }

    expect(() => eventoEdicionDiaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza fecha vacía', () => {
    const invalidData = {
      eventoEdicionId: 1,
      fecha: '',
      horaInicio: '18:00',
      horaFin: '23:00'
    }

    expect(() => eventoEdicionDiaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza horaInicio vacía', () => {
    const invalidData = {
      eventoEdicionId: 1,
      fecha: '2024-03-15',
      horaInicio: '',
      horaFin: '23:00'
    }

    expect(() => eventoEdicionDiaSchema.parse(invalidData)).toThrow()
  })

  test('rechaza horaFin vacía', () => {
    const invalidData = {
      eventoEdicionId: 1,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: ''
    }

    expect(() => eventoEdicionDiaSchema.parse(invalidData)).toThrow()
  })

  test('acepta modalidad presencial', () => {
    const validData = {
      eventoEdicionId: 1,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: '23:00',
      modalidad: 'presencial' as const
    }

    const result = eventoEdicionDiaSchema.parse(validData)

    expect(result.modalidad).toBe('presencial')
  })

  test('acepta modalidad online', () => {
    const validData = {
      eventoEdicionId: 1,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: '23:00',
      modalidad: 'online' as const
    }

    const result = eventoEdicionDiaSchema.parse(validData)

    expect(result.modalidad).toBe('online')
  })

  test('acepta modalidad hibrido', () => {
    const validData = {
      eventoEdicionId: 1,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: '23:00',
      modalidad: 'hibrido' as const
    }

    const result = eventoEdicionDiaSchema.parse(validData)

    expect(result.modalidad).toBe('hibrido')
  })

  test('rechaza modalidad inválida', () => {
    const invalidData = {
      eventoEdicionId: 1,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: '23:00',
      modalidad: 'virtual' as unknown as 'presencial'
    }

    expect(() => eventoEdicionDiaSchema.parse(invalidData)).toThrow()
  })

  test('aplica modalidad default correctamente', () => {
    const validData = {
      eventoEdicionId: 1,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: '23:00',
      modalidad: undefined
    }

    const result = eventoEdicionDiaSchema.parse(validData)

    expect(result.modalidad).toBe('presencial')
  })

  test('permite lugarId opcional', () => {
    const validData = {
      eventoEdicionId: 1,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: '23:00',
      lugarId: undefined
    }

    const result = eventoEdicionDiaSchema.parse(validData)

    expect(result.lugarId).toBeUndefined()
  })

  test('rechaza lugarId no positivo', () => {
    const invalidData = {
      eventoEdicionId: 1,
      lugarId: 0,
      fecha: '2024-03-15',
      horaInicio: '18:00',
      horaFin: '23:00'
    }

    expect(() => eventoEdicionDiaSchema.parse(invalidData)).toThrow()
  })
})

describe('MODALIDAD constant', () => {
  test('contiene valores correctos', () => {
    expect(MODALIDAD.PRESENCIAL).toBe('presencial')
    expect(MODALIDAD.ONLINE).toBe('online')
    expect(MODALIDAD.HIBRIDO).toBe('hibrido')
  })

  test('contiene exactamente tres modalidades', () => {
    expect(Object.keys(MODALIDAD)).toHaveLength(3)
  })

  test('valores son strings', () => {
    Object.values(MODALIDAD).forEach((value) => {
      expect(typeof value).toBe('string')
    })
  })
})
