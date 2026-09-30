import Image from 'next/image'

export function HeroSection() {
  return (
    <header className='mx-auto h-fit max-w-6xl space-y-12'>
      <section className='flex flex-col items-center px-2'>
        <div className='relative w-fit lg:-mr-14'>
          <Image
            src='https://cdn.frijolmagico.cl/asoc/logos/logotipo_color.png'
            alt='Logotipo de la Asociación Cultural Frijol Mágico'
            width={1428}
            height={814}
            priority
            className='mx-auto w-full lg:max-w-2xl'
            loading='eager'
          />
        </div>
        <p className='font-roboto-mono text-foreground/80 w-prose mx-auto max-w-xl px-2 text-center text-xs tracking-wide uppercase'>
          Espacio que reúne a las y los Ilustradores de la Región de Coquimbo,
          generando distintas instancias que ayuden a potenciar su trabajo.
        </p>
      </section>
      <section
        aria-labelledby='maintenance-title'
        className='space-y-4 px-4 text-center'
      >
        <h1 id='maintenance-title' className='text-3xl font-semibold md:text-4xl'>
          Estamos realizando tareas de mantenimiento
        </h1>
        <p className='text-lg text-foreground/70'>
          Volveremos pronto. Gracias por tu paciencia.
        </p>
      </section>
    </header>
  )
}
