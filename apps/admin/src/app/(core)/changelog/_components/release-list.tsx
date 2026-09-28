import ReactMarkdown from 'react-markdown'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/shared/components/ui/accordion'
import type { GithubRelease } from '../_lib/data-access-layer/get-github-releases'

interface ReleaseListProps {
  releases: GithubRelease[]
}

function formatPublishedDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' }).format(
    new Date(value)
  )
}

export function ReleaseList({ releases }: ReleaseListProps) {
  if (releases.length === 0) return null

  return (
    <Accordion
      multiple
      defaultValue={[String(releases[0].id)]}
      className='max-w-4xl'
    >
      {releases.map((release) => (
        <AccordionItem key={release.id} value={String(release.id)}>
          <AccordionTrigger>
            <span className='flex flex-col gap-1'>
              <span>{release.name}</span>
              <span className='text-muted-foreground text-xs font-normal'>
                {release.tagName} · {formatPublishedDate(release.publishedAt)}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className='prose prose-sm dark:prose-invert max-w-none'>
              <ReactMarkdown>{release.body}</ReactMarkdown>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
