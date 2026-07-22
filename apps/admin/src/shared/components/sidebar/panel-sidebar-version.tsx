import { APP_VERSION } from '@frijolmagico/utils/version'

export function PanelSidebarVersion() {
  return (
    <div className='text-sidebar-foreground/30 px-3 py-2 text-center font-mono text-[10px] leading-none'>
      v{APP_VERSION}
    </div>
  )
}
