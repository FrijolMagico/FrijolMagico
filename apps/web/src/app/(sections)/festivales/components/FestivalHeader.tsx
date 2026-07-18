interface FestivalHeaderProps {
  nombre: string
  edicion: string
  edicionNombre?: string | null
}

export const FestivalHeader = ({
  nombre,
  edicion,
  edicionNombre
}: FestivalHeaderProps) => (
  <header>
    <h3 className='text-primary text-3xl leading-none font-black md:text-3xl md:tracking-tight'>
      {nombre} <span className='text-secondary'>{edicion}</span>
    </h3>
    {edicionNombre && (
      <p className='text-accent mt-2 leading-none font-semibold'>
        {edicionNombre}
      </p>
    )}
  </header>
)
