import { signal } from '@preact/signals'

function readHash(): string {
  return decodeURIComponent(location.hash.replace(/^#\/?/, ''))
}

export const route = signal(readHash())

addEventListener('hashchange', () => {
  route.value = readHash()
  scrollTo(0, 0)
})

export function tourHref(id: string): string {
  return `#/tour/${id}`
}
