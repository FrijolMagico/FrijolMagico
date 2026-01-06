import { redirect } from 'next/navigation'
import { paths } from '@/config/paths'

export default function FestivalesPage() {
  // TODO: Página con línea de tiempo de los festivales pasados.
  // consultar en base de datos por datos de métricas (temporalmente)
  redirect(paths.festival[2025].base)
}
