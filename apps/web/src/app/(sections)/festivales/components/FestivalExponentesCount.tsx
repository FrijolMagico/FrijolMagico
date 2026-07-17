interface FestivalExponentesCountProps {
  count: number
}

export const FestivalExponentesCount = ({
  count
}: FestivalExponentesCountProps) => (
  <dl className='flex flex-col items-center justify-center'>
    <dt className='sr-only'>Cantidad de exponentes</dt>
    <dd className='text-primary -ml-1 text-4xl leading-none font-black tracking-tighter'>
      {count}
    </dd>
    <span className='text-foreground/50 text-[10px] font-bold tracking-wider uppercase'>
      Exponentes
    </span>
  </dl>
)
