import { useMemo } from 'preact/hooks'
import { renderMarkdown } from '../markdown'

export function Markdown({ text, class: className }: { text: string; class?: string }) {
  const html = useMemo(() => renderMarkdown(text), [text])
  return <div class={`markdown ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: html }} />
}
