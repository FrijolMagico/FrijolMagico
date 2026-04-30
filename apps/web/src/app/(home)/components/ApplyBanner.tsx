import Link from 'next/link'

interface ApplyBannerProps {
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
  palette?: string
}

export function ApplyBanner({
  title = 'Convocatoria',
  description,
  buttons,
  palette = 'base'
}: ApplyBannerProps) {
  return (
    <section
      data-palette={palette}
      className='bg-palette-background relative flex h-full w-full items-center justify-center'
    >
      <div className='-mt-18 w-screen max-w-xl space-y-6'>
        <div>
          <span className='font-roboto-mono text-palette-foreground text-md block text-center font-light'>
            Nueva
          </span>
          <h2 className='wavy-underline text-palette-accent text-center text-2xl font-bold tracking-wide uppercase lg:text-3xl'>
            {title}
          </h2>
        </div>
        {description && (
          <p className='text-palette-foreground text-center text-3xl font-bold lg:text-4xl'>
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
