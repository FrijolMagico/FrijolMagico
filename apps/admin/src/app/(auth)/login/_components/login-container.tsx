import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function LoginContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-white bg-linear-to-br'>
      <Card className='relative z-10 w-full max-w-md'>
        <CardHeader className='items-center'>
          <Image
            src='/logotipo_mono.png'
            alt='Frijol Mágico'
            width={64}
            height={64}
            className='mx-auto'
            priority
          />
          <div className='text-center'>
            <span>Asociación Cultural</span>
            <h1 className='text-4xl font-black'>Frijol Mágico</h1>
            <p className='text-muted-foreground pt-2 text-sm'>
              Panel de Administración
            </p>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>{children}</CardContent>
      </Card>
    </div>
  )
}
