export const Background = () => {
  const width = 38.35
  const height = 58
  const color = '00000020'
  const strokeDasharray = '10 10'

  return (
    <div className='absolute inset-0 -z-10 overflow-hidden'>
      <div
        className='absolute inset-0 -left-1/2 w-[200%]'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Cline x1='0' y1='0' x2='0' y2='64' stroke='%23${color}' stroke-width='1' stroke-dasharray='${strokeDasharray}' /%3E%3C/svg%3E")`,
          backgroundSize: `${width}px ${height}px`,
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat'
        }}
      />
    </div>
  )
}
