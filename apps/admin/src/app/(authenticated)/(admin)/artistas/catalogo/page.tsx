import { CatalogContent } from './_components/catalog-content'

export default function CatalogArtistsPage() {
  return (
    <article className='h-full min-h-max space-y-6'>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>
          Catálogo de Artistas
        </h1>
        <p className='text-muted-foreground'>
          Gestiona los artistas que aparecen en el catálogo público. Arrastra
          las filas para reordenar.
        </p>
      </header>

      <CatalogContent />
    </article>
  )
}
