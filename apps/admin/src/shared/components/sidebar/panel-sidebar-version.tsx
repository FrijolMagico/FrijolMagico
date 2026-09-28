import Link from 'next/link'

import { APP_VERSION } from '@frijolmagico/utils/version'

export function PanelSidebarVersion() {
  return (
    <div className='text-sidebar-foreground/30 flex items-center justify-center gap-2 px-3 py-2 font-mono text-[10px] leading-none'>
      <span>v{APP_VERSION}</span>-
      <Link href='/changelog' className='hover:text-sidebar-foreground'>
        Changelog
      </Link>
    </div>
  )
}
