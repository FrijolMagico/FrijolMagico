import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'

export function LoginContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className='bg-background relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br'>
      <Card>
        <CardHeader>
          <CardTitle>
            <Image
              src='/logotipo_asoc_2026_color.png'
              alt='Frijol Mágico'
              width={400}
              height={228}
              className='mx-auto w-52'
              priority
            />
            <p className='sr-only'>Asociación Cultural Frijol Mágico</p>
          </CardTitle>
          <CardDescription className='text-center'>
            Inicia sesión para acceder al panel de administración
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
