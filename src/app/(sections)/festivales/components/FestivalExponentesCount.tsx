interface FestivalExponentesCountProps {
  count: number
}

export const FestivalExponentesCount = ({
  count,
}: FestivalExponentesCountProps) => (
  <div className='flex flex-col items-center justify-center'>
    <strong className='text-fm-black text-7xl leading-none font-black tracking-tighter'>
      {count}
    </strong>
    <span className='text-fm-black/50 mt-2 ml-1 text-[10px] font-extrabold tracking-[0.2em] uppercase'>
      Exponentes
    </span>
  </div>
)
