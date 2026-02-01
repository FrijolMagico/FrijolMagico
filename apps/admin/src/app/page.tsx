import { Button } from '@frijolmagico/ui/button'
import { cn } from '@frijolmagico/ui/cn'

export default function HomePage() {
  return (
    <main>
      <h1 className={cn('text-2xl font-bold', true && 'text-fm-green')}>
        Frijol Mágico - Admin
      </h1>
      <p>Panel de administración en construcción</p>
      <Button>Click me!</Button>
    </main>
  )
}
