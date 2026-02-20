import { CatalogContent } from './_components/catalog-content'

export default function CatalogArtistsPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-foreground text-2xl font-bold'>
          Catálogo de Artistas
        </h1>
        <p className='text-muted-foreground'>
          Gestiona los artistas que aparecen en el catálogo público. Arrastra
          las filas para reordenar.
        </p>
      </div>

      <CatalogContent />
    </div>
  )
}
