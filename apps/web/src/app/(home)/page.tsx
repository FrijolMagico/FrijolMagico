import { HeroSection } from './components/HeroSection'

export default function Home() {
  return (
    <main
      data-palette='base'
      className='mx-auto h-full w-full flex-1 space-y-12 overflow-x-hidden pt-24 md:py-12'
    >
      <HeroSection />
    </main>
  )
}
