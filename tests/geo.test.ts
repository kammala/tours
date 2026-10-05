import { describe, expect, it } from 'vitest'
import { autoSelect, distanceM, formatMinutes, nearestPoint, totalWalkMinutes } from '../src/geo'
import { GRAVENSTEEN, KORENMARKT, LOOP, point } from './fixtures'

describe('distanceM', () => {
  it('measures Korenmarkt to Gravensteen at about 300 m', () => {
    expect(distanceM(KORENMARKT, GRAVENSTEEN)).toBeGreaterThan(280)
    expect(distanceM(KORENMARKT, GRAVENSTEEN)).toBeLessThan(320)
  })
})

describe('nearestPoint', () => {
  it('returns index and distance of the closest point', () => {
    expect(nearestPoint(LOOP, { lat: 51.0572, lng: 3.7209 })).toMatchObject({ index: 2 })
  })
})

describe('autoSelect', () => {
  it('returns undefined when no point is within its radius', () => {
    expect(autoSelect(LOOP, { lat: 51.07, lng: 3.7 }, undefined)).toBeUndefined()
  })

  it('picks the first visit of a revisited place at the start of the tour', () => {
    expect(autoSelect(LOOP, KORENMARKT, undefined)).toBe(1)
  })

  it('picks the later visit of a revisited place once the tour has progressed past the first', () => {
    expect(autoSelect(LOOP, KORENMARKT, 3)).toBe(4)
  })

  it('keeps the current point when standing at it', () => {
    expect(autoSelect(LOOP, KORENMARKT, 1)).toBe(1)
  })

  it('falls back to the nearest in-range point when walking backwards', () => {
    expect(autoSelect(LOOP, GRAVENSTEEN, 5)).toBe(2)
  })

  it('honours a larger per-point radius', () => {
    const park = point('Park', 52.358, 4.8686, { radius_m: 400 })
    const position = { lat: 52.3605, lng: 4.8686 }
    expect(autoSelect([point('Elsewhere', 52.37, 4.89), point('Park', 52.358, 4.8686)], position, undefined)).toBeUndefined()
    expect(autoSelect([point('Elsewhere', 52.37, 4.89), park], position, undefined)).toBe(1)
  })
})

describe('formatMinutes', () => {
  it('formats a single value and a range', () => {
    expect(formatMinutes(10)).toBe('10')
    expect(formatMinutes([30, 40])).toBe('30–40')
  })
})

describe('totalWalkMinutes', () => {
  it('sums numbers and ranges, skipping the start point', () => {
    expect(totalWalkMinutes([point('A', 0, 0), point('B', 0, 0, { walk_min: 10 }), point('C', 0, 0, { walk_min: [20, 30] })])).toEqual([30, 40])
  })
})
