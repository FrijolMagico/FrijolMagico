import { OrganizationSection } from './_components/organization-section'
import { TeamSection } from './_components/team-section'

export default function GeneralPage() {
  return (
    <article className='h-full min-h-max space-y-6'>
      <header>
        <h1 className='text-foreground text-2xl font-bold'>General</h1>
        <p className='text-muted-foreground'>
          Gestiona la información general y el equipo de Frijol Mágico.
        </p>
      </header>

      <section className='grid gap-6 md:grid-cols-[40%_60%]'>
        <OrganizationSection />
        <TeamSection />
      </section>
    </article>
  )
}
