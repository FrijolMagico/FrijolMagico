import type {
  CatalogArtist,
  Artista,
  CatalogoArtista
} from '@/app/(authenticated)/(admin)/artistas/catalogo/_types'

export function splitCatalogArtist(mixed: CatalogArtist[]): {
  artistas: Artista[]
  catalogoArtistas: CatalogoArtista[]
} {
  return {
    artistas: mixed.map((item) => ({
      id: item.artistaId,
      nombre: item.nombre,
      pseudonimo: item.pseudonimo,
      slug: item.slug,
      correo: item.correo,
      rrss: item.rrss,
      ciudad: item.ciudad,
      pais: item.pais,
      avatarUrl: item.avatarUrl
    })),
    catalogoArtistas: mixed.map((item) => ({
      id: item.catalogoId,
      artistaId: item.artistaId,
      orden: item.orden,
      destacado: item.destacado,
      activo: item.activo,
      descripcion: item.descripcion,
      catalogoUpdatedAt: item.catalogoUpdatedAt
    }))
  }
}
