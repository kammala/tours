import { describe, expect, it } from 'vitest'
import { fullRouteParts, legUrl, MAX_WAYPOINTS, viaLabel, viaQuery } from '../src/gmaps'
import { GRAVENSTEEN, KORENMARKT, LOOP, point, START, tour } from './fixtures'

function params(url: string) {
  return Object.fromEntries(new URL(url).searchParams)
}

describe('viaQuery', () => {
  it('appends the city suffix to bare names only', () => {
    expect(viaQuery('Kouter', 'Gent')).toBe('Kouter, Gent')
    expect(viaQuery('Stera, Lange Vesting 16, Brugge', 'Brugge')).toBe('Stera, Lange Vesting 16, Brugge')
    expect(viaQuery({ lat: 51.1, lng: 3.2 }, 'Gent')).toBe('51.1,3.2')
  })
})

describe('viaLabel', () => {
  it('shows the name of a pinned via instead of its coordinates', () => {
    expect(viaLabel({ name: 'Amstelveenseweg', lat: 52.356, lng: 4.8566 })).toBe('Amstelveenseweg')
    expect(viaLabel({ lat: 52.356, lng: 4.8566 })).toBe('52.3560, 4.8566')
  })
})

describe('legUrl', () => {
  it('is absent for the start point', () => {
    expect(legUrl(tour(LOOP), 0)).toBeUndefined()
  })

  it('routes from the previous point through approach vias using the place override', () => {
    const data = tour([START, point('Korenmarkt', 51.0546, 3.7214, { approach: ['Kouter', 'Veldstraat'] })])
    expect(params(legUrl(data, 1)!)).toEqual({
      api: '1',
      travelmode: 'walking',
      origin: 'Viernulvier, Sint-Pietersnieuwstraat 23, Gent',
      waypoints: 'Kouter, Gent|Veldstraat, Gent',
      destination: 'Korenmarkt, Gent',
    })
  })

  it('is absent for a short leg without vias', () => {
    expect(legUrl(tour([KORENMARKT, point('Sint-Michielsbrug', 51.0538, 3.7203)]), 1)).toBeUndefined()
  })

  it('is kept for a short leg with vias', () => {
    expect(legUrl(tour([KORENMARKT, { ...GRAVENSTEEN, approach: ['Sint-Michielsbrug'] }]), 1)).toBeDefined()
  })

  it('is kept for a long leg without vias', () => {
    expect(params(legUrl(tour([KORENMARKT, START]), 1)!)).toMatchObject({ origin: 'Korenmarkt, Gent' })
  })

  it('starts at the previous point exit when it has an inside walk', () => {
    const park = point('Vondelpark', 52.358, 4.8686, { inside: ['Vondelkerk', { name: 'Amstelveenseweg', lat: 52.356, lng: 4.8566 }] })
    const data = tour([park, point('Jordaan', 52.375, 4.88)], { place_suffix: 'Amsterdam' })
    expect(params(legUrl(data, 1)!)).toMatchObject({ origin: '52.356,4.8566', destination: 'Jordaan, Amsterdam' })
  })
})

describe('fullRouteParts', () => {
  it('prefers the hand-made map url', () => {
    expect(fullRouteParts(tour(LOOP, { map_url: 'https://maps.app.goo.gl/abc' }))).toEqual([{ url: 'https://maps.app.goo.gl/abc', from: 0, to: 5 }])
  })

  it('uses a single link through all points when within the waypoint limit', () => {
    const [part, ...rest] = fullRouteParts(tour(LOOP))
    expect(rest).toEqual([])
    expect(params(part.url)).toMatchObject({ origin: 'Viernulvier, Sint-Pietersnieuwstraat 23, Gent', destination: 'Viernulvier, Sint-Pietersnieuwstraat 23, Gent' })
    expect(params(part.url).waypoints.split('|')).toHaveLength(4)
  })

  it('splits long routes into parts sharing their boundary point', () => {
    const points = Array.from({ length: 25 }, (_, index) => point(`P${index}`, 51 + index / 1000, 3.7))
    const parts = fullRouteParts(tour(points))
    expect(parts.map(({ from, to }) => [from, to])).toEqual([[0, 10], [10, 20], [20, 24]])
    parts.forEach(({ url }) => expect(params(url).waypoints.split('|').length).toBeLessThanOrEqual(MAX_WAYPOINTS))
    expect(params(parts[1].url).origin).toBe('P10, Gent')
  })
})
