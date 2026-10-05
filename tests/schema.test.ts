import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { tourSchema } from '../src/data/schema'
import { loadTours } from '../src/data/vite-plugin-tours'
import { KORENMARKT, START, tour } from './fixtures'

describe('tourSchema', () => {
  it('accepts a minimal tour', () => {
    expect(tourSchema.safeParse(tour([START, KORENMARKT])).success).toBe(true)
  })

  it('rejects a point without coordinates', () => {
    const { lat: _lat, ...noLat } = KORENMARKT
    expect(tourSchema.safeParse(tour([START, noLat as typeof KORENMARKT])).success).toBe(false)
  })

  it('rejects a localized field with neither language', () => {
    expect(tourSchema.safeParse(tour([START, { ...KORENMARKT, short: {} }])).success).toBe(false)
  })

  it('rejects unknown keys so typos surface', () => {
    expect(tourSchema.safeParse(tour([START, { ...KORENMARKT, walkmin: 5 } as typeof KORENMARKT])).success).toBe(false)
  })
})

describe('tours directory', () => {
  it('contains only valid tours with ids derived from their paths', () => {
    const tours = loadTours(fileURLToPath(new URL('../tours', import.meta.url)))
    expect(tours.length).toBeGreaterThan(0)
    tours.forEach((loaded) => expect(loaded.id).toMatch(/^[a-z-]+\/[a-z0-9-]+$/))
  })
})
