import { useId, type CSSProperties, type ReactNode } from 'react'

import { cn } from '@/utils/cn'

const VIEWBOX_WIDTH = 1920
const FISSURE_EDGE_HEIGHT = 99
const DEFAULT_HEIGHT = 600

export const FISSURE_EDGE_PATH =
  'M1920 83.4272C1907.88 86.5114 1897.07 87.4909 1891.33 87.4907C1866.95 102.053 1848.95 93.5586 1843.01 87.4907C1819.22 99.1412 1816.99 80.2086 1779.81 82.3931C1750.08 74.8207 1725.79 79.7231 1717.37 83.1211C1706.66 70.6779 1688.13 72.1112 1680.2 74.3833C1632.02 98.2663 1614.53 92.5866 1611.8 86.7612C1596.93 94.0417 1583.55 69.2861 1573.89 66.3735C1564.22 63.4619 1559.76 76.5621 1559.02 76.5674C1558.27 76.5662 1548.61 72.9258 1533.74 70.0137C1521.85 67.6836 1494.59 73.4121 1482.45 76.5674C1466.39 71.3251 1419.75 74.383 1398.44 76.5674C1381.34 70.7422 1393.23 69.2856 1351.6 78.7515C1309.97 88.2174 1318.89 75.8399 1304.02 80.937C1292.13 85.0144 1269.33 83.6066 1259.42 82.3931C1256.69 84.3348 1250.05 88.3643 1245.29 88.9468C1240.54 89.5292 1236.37 87.7321 1234.89 86.7612C1234.89 89.6737 1228.44 94.2866 1225.22 96.2285C1187.31 102.782 1154.6 91.1309 1153.11 91.1309C1151.62 91.1308 1153.11 88.9461 1141.96 94.043C1130.81 99.1396 1124.12 86.7612 1123.37 86.7612C1101.07 97.6827 1095.12 83.8504 1090.66 80.209C1086.2 76.5682 1064.64 72.1985 1054.98 67.8296C1045.31 63.4605 1031.19 48.1691 1023.01 45.2563C1016.47 42.9266 982.123 44.7723 965.769 45.9858C959.078 37.9767 914.477 41.6158 906.296 43.8003C898.119 45.9846 889.197 38.7056 886.966 40.8882C884.733 43.0722 852.766 41.6164 818.571 51.8101C791.213 59.9653 754.637 55.2081 739.768 51.8101C718.953 28.5105 695.163 46.7124 686.985 53.2661C680.443 58.5088 672.363 57.8786 669.142 56.9077C664.929 55.2087 655.763 51.8106 652.789 51.8101C649.071 51.8097 634.948 39.4337 630.486 38.7041C626.919 38.1217 623.548 39.9172 622.308 40.8882C612.644 27.7815 606.696 27.0523 591.828 20.499C579.932 15.2572 550.195 31.9077 536.814 40.8882C523.433 33.6071 508.564 40.1597 495.183 42.3442C484.479 44.0916 477.838 43.0724 475.854 42.3442C465.199 46.9559 437.047 54.4321 409.689 47.4419C382.332 40.4519 360.625 48.8985 353.19 53.9956C327.17 53.9956 298.176 72.9267 289.998 75.8394C281.82 78.752 262.491 77.2957 262.491 75.8394C262.489 74.3799 254.315 60.5498 252.828 60.5479C251.638 60.5479 249.855 62.4903 249.111 63.4614C237.217 58.8012 204.009 53.2665 188.893 51.082L115.295 50.354C101.021 56.1791 75.6454 47.9266 64.7417 43.0723H55.0781V45.2563C71.8519 66.9429 14.1437 54.8232 0 52.2539L0 0H1920V83.4272Z'

const FISSURE_EDGE_OUTLINE_PATH =
  'M1920 83.4272C1907.88 86.5114 1897.07 87.4909 1891.33 87.4907C1866.95 102.053 1848.95 93.5586 1843.01 87.4907C1819.22 99.1412 1816.99 80.2086 1779.81 82.3931C1750.08 74.8207 1725.79 79.7231 1717.37 83.1211C1706.66 70.6779 1688.13 72.1112 1680.2 74.3833C1632.02 98.2663 1614.53 92.5866 1611.8 86.7612C1596.93 94.0417 1583.55 69.2861 1573.89 66.3735C1564.22 63.4619 1559.76 76.5621 1559.02 76.5674C1558.27 76.5662 1548.61 72.9258 1533.74 70.0137C1521.85 67.6836 1494.59 73.4121 1482.45 76.5674C1466.39 71.3251 1419.75 74.383 1398.44 76.5674C1381.34 70.7422 1393.23 69.2856 1351.6 78.7515C1309.97 88.2174 1318.89 75.8399 1304.02 80.937C1292.13 85.0144 1269.33 83.6066 1259.42 82.3931C1256.69 84.3348 1250.05 88.3643 1245.29 88.9468C1240.54 89.5292 1236.37 87.7321 1234.89 86.7612C1234.89 89.6737 1228.44 94.2866 1225.22 96.2285C1187.31 102.782 1154.6 91.1309 1153.11 91.1309C1151.62 91.1308 1153.11 88.9461 1141.96 94.043C1130.81 99.1396 1124.12 86.7612 1123.37 86.7612C1101.07 97.6827 1095.12 83.8504 1090.66 80.209C1086.2 76.5682 1064.64 72.1985 1054.98 67.8296C1045.31 63.4605 1031.19 48.1691 1023.01 45.2563C1016.47 42.9266 982.123 44.7723 965.769 45.9858C959.078 37.9767 914.477 41.6158 906.296 43.8003C898.119 45.9846 889.197 38.7056 886.966 40.8882C884.733 43.0722 852.766 41.6164 818.571 51.8101C791.213 59.9653 754.637 55.2081 739.768 51.8101C718.953 28.5105 695.163 46.7124 686.985 53.2661C680.443 58.5088 672.363 57.8786 669.142 56.9077C664.929 55.2087 655.763 51.8106 652.789 51.8101C649.071 51.8097 634.948 39.4337 630.486 38.7041C626.919 38.1217 623.548 39.9172 622.308 40.8882C612.644 27.7815 606.696 27.0523 591.828 20.499C579.932 15.2572 550.195 31.9077 536.814 40.8882C523.433 33.6071 508.564 40.1597 495.183 42.3442C484.479 44.0916 477.838 43.0724 475.854 42.3442C465.199 46.9559 437.047 54.4321 409.689 47.4419C382.332 40.4519 360.625 48.8985 353.19 53.9956C327.17 53.9956 298.176 72.9267 289.998 75.8394C281.82 78.752 262.491 77.2957 262.491 75.8394C262.489 74.3799 254.315 60.5498 252.828 60.5479C251.638 60.5479 249.855 62.4903 249.111 63.4614C237.217 58.8012 204.009 53.2665 188.893 51.082L115.295 50.354C101.021 56.1791 75.6454 47.9266 64.7417 43.0723H55.0781V45.2563C71.8519 66.9429 14.1437 54.8232 0 52.2539'

function createMaskStyle(height: number): CSSProperties {
  const bottomOffset = height - FISSURE_EDGE_HEIGHT
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEWBOX_WIDTH} ${height}" preserveAspectRatio="none"><rect x="0" y="0" width="${VIEWBOX_WIDTH}" height="${bottomOffset + 1}" fill="white"/><path d="${FISSURE_EDGE_PATH}" fill="white" transform="translate(0 ${bottomOffset})"/></svg>`
  const image = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
  return {
    WebkitMaskImage: image,
    maskImage: image,
    WebkitMaskPosition: '0 0',
    maskPosition: '0 0',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%'
  }
}

interface FissureBannerProps {
  children?: ReactNode
  className?: string
  contentClassName?: string
  height?: number
}

interface FissureLayoutProps {
  height: number
  bottomOffset: number
}

interface FissureInnerShadowProps extends FissureLayoutProps {
  blurId: string
  maskId: string
}

function FissureOutline({ height, bottomOffset }: FissureLayoutProps) {
  return (
    <svg
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 h-full w-full overflow-visible'
      preserveAspectRatio='none'
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
    >
      <path
        className='stroke-foreground'
        d={FISSURE_EDGE_OUTLINE_PATH}
        fill='none'
        strokeWidth={2}
        transform={`translate(0 ${bottomOffset})`}
        vectorEffect='non-scaling-stroke'
      />
    </svg>
  )
}

function FissureInnerShadow({
  blurId,
  maskId,
  height,
  bottomOffset
}: FissureInnerShadowProps) {
  return (
    <svg
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible'
      preserveAspectRatio='none'
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
    >
      <defs>
        <mask id={maskId} maskUnits='userSpaceOnUse'>
          <rect
            x='0'
            y='0'
            width={VIEWBOX_WIDTH}
            height={bottomOffset + 1}
            fill='white'
          />

          <path
            d={FISSURE_EDGE_PATH}
            fill='white'
            transform={`translate(0 ${bottomOffset})`}
          />
        </mask>

        <filter id={blurId} x='-10%' y='-20%' width='120%' height='140%'>
          <feGaussianBlur stdDeviation='6' />
        </filter>
      </defs>

      <g mask={`url(#${maskId})`}>
        <path
          d={FISSURE_EDGE_OUTLINE_PATH}
          className='stroke-foreground/20'
          fill='none'
          strokeWidth='16'
          filter={`url(#${blurId})`}
          transform={`translate(0 ${bottomOffset})`}
        />
      </g>
    </svg>
  )
}

function FissureClickBlocker({ height, bottomOffset }: FissureLayoutProps) {
  const blockerPath = `M0 0 H${VIEWBOX_WIDTH} V${FISSURE_EDGE_HEIGHT} H0 Z ${FISSURE_EDGE_PATH}`

  return (
    <svg
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 z-50 h-full w-full overflow-visible'
      preserveAspectRatio='none'
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${height}`}
    >
      <path
        className='pointer-events-auto cursor-auto'
        d={blockerPath}
        fill='transparent'
        fillRule='evenodd'
        transform={`translate(0 ${bottomOffset})`}
      />
    </svg>
  )
}

export function FissureBanner({
  children,
  className,
  contentClassName,
  height = DEFAULT_HEIGHT
}: FissureBannerProps) {
  const baseId = useId().replace(/:/g, '')
  const maskId = `${baseId}-mask`
  const blurId = `${baseId}-blur`
  const bottomOffset = height - FISSURE_EDGE_HEIGHT
  const maskStyle = createMaskStyle(height)

  return (
    <header
      className={cn('relative w-full overflow-hidden', className)}
      style={{ height }}
    >
      <div
        className='relative left-1/2 w-screen min-w-7xl -translate-x-1/2'
        style={{ height }}
      >
        <div
          className='bg-background absolute inset-0 overflow-hidden'
          style={maskStyle}
        >
          <div
            className={cn(
              'relative z-0 flex h-full w-full items-center justify-center',
              contentClassName
            )}
          >
            {children}
          </div>
        </div>

        <FissureInnerShadow
          blurId={blurId}
          maskId={maskId}
          height={height}
          bottomOffset={bottomOffset}
        />
        <FissureOutline height={height} bottomOffset={bottomOffset} />
        <FissureClickBlocker height={height} bottomOffset={bottomOffset} />
      </div>
    </header>
  )
}
