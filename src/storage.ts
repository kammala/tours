import { signal, type Signal } from '@preact/signals'

export type PersistedSet = {
  items: Signal<ReadonlySet<string>>
  set: (items: string[], present: boolean) => void
}

function readItems(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function persistedSet(key: string): PersistedSet {
  const items = signal<ReadonlySet<string>>(new Set(readItems(key)))
  return {
    items,
    set(changed, present) {
      if (changed.every((item) => items.value.has(item) === present)) return
      const next = new Set(items.value)
      changed.forEach((item) => (present ? next.add(item) : next.delete(item)))
      items.value = next
      try {
        localStorage.setItem(key, JSON.stringify([...next]))
      } catch {}
    },
  }
}
