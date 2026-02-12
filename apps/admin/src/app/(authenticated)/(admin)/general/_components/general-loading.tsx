import { CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'

// TODO: Puede ser un diseño globla de UI para mostrar loadings en secciones o errores
export function GeneralLoading({ message = 'Cargando información...' }) {
  return (
    <CardContent className='space-y-6'>
      <Skeleton className='text-muted-foreground px-6 py-4 text-sm'>
        {message}
      </Skeleton>
    </CardContent>
  )
}
