interface FestivalExponentesCountProps {
  count: number
}

export const FestivalExponentesCount = ({
  count,
}: FestivalExponentesCountProps) => (
  <dl className='flex flex-col items-center justify-center'>
    <dt className='sr-only'>Cantidad de exponentes</dt>
    <dd className='text-fm-black text-7xl leading-none font-black tracking-tighter'>
      {count}
    </dd>
    <span className='text-fm-black/50 mt-2 ml-1 text-[10px] font-extrabold tracking-[0.2em] uppercase'>
      Exponentes
    </span>
  </dl>
)
