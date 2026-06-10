interface FestivalHeaderProps {
  id: number
  nombre: string
  edicion: string
  edicionNombre?: string | null
}

export const FestivalHeader = ({
  id,
  nombre,
  edicion,
  edicionNombre
}: FestivalHeaderProps) => (
  <header>
    <h3 className='text-primary pb-2 text-4xl leading-none font-black tracking-tight md:text-5xl'>
      {id === 1 && <span className='text-secondary'>{edicion}</span>} {nombre}
    </h3>
    {edicionNombre && (
      <p className='text-accent text-xl font-semibold'>{edicionNombre}</p>
    )}
  </header>
)
