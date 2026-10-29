import { Header } from '@/components/Header'
import { LinkBtn } from '@/components/LinkBtn'
import { LinkCta } from '@/components/link-cta'
import { fundingProjects } from './data/funding-projects'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Transparencia',
  description:
    'Proyectos, líneas de financiamiento, montos y convenios de Frijol Mágico e informe de impacto del festival 2026.'
}

export default function TransparencyPage() {
  return (
    <>
      <Header
        title='# Transparencia'
        description='Conoce los proyectos que hemos realizado, sus fuentes de financiamiento y los convenios que los respaldan. Revisa también el informe de impacto del Festival Frijol Mágico 2026.'
      />
      <main className='container mx-auto w-full max-w-5xl min-w-0 space-y-12 px-4 py-12'>
        <div
          role='region'
          aria-label='Proyectos y financiamiento'
          tabIndex={0}
          className='bg-background outline-primary/50 focus-visible:outline-secondary w-full max-w-full min-w-0 overflow-x-auto rounded-3xl outline-1 outline-dashed focus-visible:outline-2 focus-visible:outline-offset-4'
        >
          <table className='font-noto text-primary w-full min-w-3xl text-left text-sm'>
            <caption className='sr-only'>
              Proyectos financiados y enlaces a sus convenios
            </caption>
            <thead className='bg-primary text-background'>
              <tr>
                <th scope='col' className='px-6 py-5'>
                  Nombre del Proyecto
                </th>
                <th scope='col' className='px-6 py-5'>
                  Línea de financiamiento
                </th>
                <th scope='col' className='px-6 py-5 text-right'>
                  Monto
                </th>
                <th scope='col' className='px-6 py-5'>
                  Link del convenio
                </th>
              </tr>
            </thead>
            <tbody>
              {fundingProjects.map((project) => (
                <tr key={project.name} className='border-primary/20 border-t'>
                  <th
                    scope='row'
                    className='px-6 py-6 font-semibold whitespace-nowrap'
                  >
                    {project.festivalSlug ? (
                      <LinkBtn
                        href={`/festivales/${project.festivalSlug}`}
                        withArrow
                        className='font-noto hover:text-accent focus-visible:outline-primary w-max shrink-0 gap-2 rounded-sm normal-case focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none [&>svg]:static [&>svg]:shrink-0 [&>svg]:group-focus-visible:-rotate-45 [&>svg]:motion-reduce:transition-none'
                      >
                        {project.name}
                      </LinkBtn>
                    ) : (
                      project.name
                    )}
                  </th>
                  <td className='min-w-64 px-6 py-6 break-words'>
                    {project.funding}
                  </td>
                  <td className='px-6 py-6 text-right whitespace-nowrap tabular-nums'>
                    {project.amount}
                  </td>
                  <td className='px-6 py-6'>
                    <a
                      href={project.agreementUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label={`Ver convenio de ${project.name} (abre en una nueva pestaña)`}
                      className='wavy-underline text-primary hover:text-accent focus-visible:text-accent focus-visible:outline-primary inline-block rounded-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none'
                    >
                      Ver convenio
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section
          aria-labelledby='impact-report-title'
          className='border-primary/20 space-y-6 border-t pt-8 text-center'
        >
          <h2
            id='impact-report-title'
            className='font-noto text-primary text-2xl font-bold sm:text-3xl'
          >
            Informe de Impacto - Festival Frijol Mágico 2026
          </h2>
          <LinkCta
            href='https://drive.google.com/file/d/1rsLE-HjOB-ouF9riljWYCZskKPLsg6Zi/view'
            target='_blank'
            rel='noopener noreferrer'
            aria-label='Ver informe de impacto del Festival Frijol Mágico 2026 (abre en una nueva pestaña)'
            variant='offset'
            className='inline-flex'
          >
            Ver aquí
          </LinkCta>
        </section>
      </main>
    </>
  )
}
