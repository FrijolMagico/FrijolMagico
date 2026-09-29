import sanitizeHtml from 'sanitize-html'

interface ActivityDescriptionProps {
  description: string | null
}

const ALLOWED_TAGS = [
  'p',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'a',
  'br',
  's',
  'code'
]

// Tiptap wraps its output in block elements. This is only a conservative
// format hint; all HTML in that branch still passes through the sanitizer.
const EDITOR_BLOCK = /<(p|ul|ol)(?:\s[^>]*|)>[\s\S]*?<\/\1\s*>/i
const DESCRIPTION_CLASS =
  'text-palette-foreground/70 text-sm leading-relaxed [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-palette-primary [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_ul]:list-disc [&_ul]:pl-5'

export const ActivityDescription = ({
  description
}: ActivityDescriptionProps) => {
  if (!description) return null

  if (!EDITOR_BLOCK.test(description)) {
    return <div className={DESCRIPTION_CLASS}>{description}</div>
  }

  const html = sanitizeHtml(description, {
    allowedTags: ALLOWED_TAGS,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          href: attribs.href,
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      })
    },
    // These are added exclusively by the transform above, never trusted from input.
    allowedAttributes: { a: ['href', 'target', 'rel'] }
  })

  if (!html) return null

  return (
    <div
      className={DESCRIPTION_CLASS}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
