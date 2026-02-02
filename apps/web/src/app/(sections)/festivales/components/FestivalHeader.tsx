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
  edicionNombre,
}: FestivalHeaderProps) => (
  <header>
    <h3 className='from-fm-orange to-fm-yellow bg-linear-to-r bg-clip-text pb-2 text-4xl leading-none font-black tracking-tight text-transparent md:text-5xl'>
      {id === 1 && <span className='text-fm-black'>{edicion}</span>} {nombre}
    </h3>
    {edicionNombre && (
      <p className='text-fm-orange text-xl font-semibold'>{edicionNombre}</p>
    )}
  </header>
)
