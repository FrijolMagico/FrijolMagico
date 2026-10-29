import Link from 'next/link'

interface ApplyBannerProps {
  type?: string
  title?: string
  description?: string
  buttons: {
    apply: {
      text: string
      href: string
      target?: string
    }
    bases: {
      text: string
      href: string
      target?: string
    }
  }
}

export function ApplyBanner({
  type = 'Convocatoria',
  title,
  description,
  buttons
}: ApplyBannerProps) {
  return (
    <section className='bg-palette-outline relative flex h-full w-full items-center justify-center overflow-hidden px-2'>
      {/* Animated background orbs */}
      <div className='bg-palette-background pointer-events-none absolute top-0 right-0 left-0 z-0 mx-auto aspect-square w-1/2 rounded-full blur-[100px]' />

      <div className='relative z-10 w-screen max-w-lg space-y-4'>
        <div className='flex justify-center gap-2'>
          <span className='wavy-underline font-roboto-mono text-palette-foreground block text-center text-sm lowercase'>
            Nueva
          </span>
          <h2 className='text-palette-accent text-center text-xl font-bold tracking-wider uppercase'>
            {type}
          </h2>
        </div>
        {title && (
          <p className='text-palette-foreground font-canarina -mt-4 text-center text-4xl leading-none font-bold tracking-wider lg:text-6xl'>
            {title}
          </p>
        )}

        {description && (
          <p className='text-palette-accent font-canarina -mt-2 text-center text-lg leading-none tracking-wider'>
            {description}
          </p>
        )}
        <div className='flex justify-center'>
          <Link
            href={buttons.bases.href}
            target={buttons.bases.target}
            className='text-palette-foreground hover:text-palette-background hover:bg-palette-foreground border-palette-outline bg-palette-primary mx-2 inline-block rounded-lg border-2 px-4 py-2 font-bold transition duration-300'
          >
            {buttons.bases.text}
          </Link>
          <Link
            href={buttons.apply.href}
            target={buttons.apply.target}
            className='bg-palette-secondary border-palette-outline text-palette-foreground hover:bg-palette-foreground hover:text-palette-background mx-2 inline-block rounded-lg border-2 px-4 py-2 font-bold transition duration-300'
          >
            {buttons.apply.text}
          </Link>
        </div>
      </div>
    </section>
  )
}
