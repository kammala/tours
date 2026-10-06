import { describe, expect, it } from 'vitest'
import { fullRouteParts, MAX_WAYPOINTS, navigateUrl, viaLabel, viaQuery } from '../src/gmaps'
import { LOOP, point, tour } from './fixtures'

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

describe('navigateUrl', () => {
  it('sets only the destination so Maps starts at the current location', () => {
    expect(params(navigateUrl(tour(LOOP), 2))).toEqual({ api: '1', travelmode: 'walking', destination: 'Gravensteen, Gent' })
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
