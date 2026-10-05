import type { Minutes, Point } from './data/schema'

export const DEFAULT_RADIUS_M = 150
const EARTH_RADIUS_M = 6_371_000

export type LatLng = { lat: number; lng: number }

export function distanceM(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export function nearestPoint(points: Point[], position: LatLng): { index: number; distance: number } {
  return points.reduce(
    (best, point, index) => {
      const distance = distanceM(position, point)
      return distance < best.distance ? { index, distance } : best
    },
    { index: -1, distance: Infinity },
  )
}

export function autoSelect(points: Point[], position: LatLng, current: number | undefined): number | undefined {
  const inRange = points
    .map((point, index) => ({ index, distance: distanceM(position, point), radius: point.radius_m ?? DEFAULT_RADIUS_M }))
    .filter(({ distance, radius }) => distance <= radius)
  if (inRange.length === 0) return undefined
  const ahead = inRange.find(({ index }) => index >= (current ?? 0))
  if (ahead) return ahead.index
  return inRange.reduce((best, candidate) => (candidate.distance < best.distance ? candidate : best)).index
}

export function formatMinutes(minutes: Minutes): string {
  return typeof minutes === 'number' ? `${minutes}` : `${minutes[0]}–${minutes[1]}`
}

export function formatDistance(meters: number, units: { m: string; km: string }): string {
  return meters < 1000 ? `${Math.round(meters / 10) * 10} ${units.m}` : `${(meters / 1000).toFixed(1)} ${units.km}`
}

export function totalWalkMinutes(points: Point[]): [number, number] {
  return points.reduce<[number, number]>(
    ([min, max], { walk_min }) => {
      if (walk_min === undefined) return [min, max]
      const [low, high] = typeof walk_min === 'number' ? [walk_min, walk_min] : walk_min
      return [min + low, max + high]
    },
    [0, 0],
  )
}
