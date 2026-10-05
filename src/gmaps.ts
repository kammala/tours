import type { Point, TourData, Via } from './data/schema'
import { distanceM } from './geo'

const DIR_BASE = 'https://www.google.com/maps/dir/?api=1&travelmode=walking'
export const MAX_WAYPOINTS = 9
export const TRIVIAL_LEG_M = 300

export function viaQuery(via: Via, suffix?: string): string {
  if (typeof via !== 'string') return `${via.lat},${via.lng}`
  return suffix && !via.includes(',') ? `${via}, ${suffix}` : via
}

export function viaLabel(via: Via): string {
  if (typeof via === 'string') return via.split(',')[0]
  return via.name ?? `${via.lat.toFixed(4)}, ${via.lng.toFixed(4)}`
}

export function pointQuery(point: Point, suffix?: string): string {
  return point.place ?? viaQuery(point.name.en ?? point.name.ru ?? '', suffix)
}

function exitQuery(point: Point, suffix?: string): string {
  const exit = point.inside?.at(-1)
  return exit === undefined ? pointQuery(point, suffix) : viaQuery(exit, suffix)
}

export function directionsUrl(stops: string[]): string {
  const params = new URLSearchParams({ origin: stops[0], destination: stops[stops.length - 1] })
  if (stops.length > 2) params.set('waypoints', stops.slice(1, -1).join('|'))
  return `${DIR_BASE}&${params}`
}

export function navigateUrl(tour: TourData, index: number): string {
  const params = new URLSearchParams({ destination: pointQuery(tour.points[index], tour.place_suffix) })
  return `${DIR_BASE}&${params}`
}

export function legUrl(tour: TourData, index: number): string | undefined {
  if (index === 0) return undefined
  const suffix = tour.place_suffix
  const point = tour.points[index]
  const previous = tour.points[index - 1]
  if (!point.approach?.length && !previous.inside && distanceM(previous, point) < TRIVIAL_LEG_M) return undefined
  return directionsUrl([
    exitQuery(previous, suffix),
    ...(point.approach ?? []).map((via) => viaQuery(via, suffix)),
    pointQuery(point, suffix),
  ])
}

export function insideUrl(tour: TourData, index: number): string | undefined {
  const point = tour.points[index]
  if (!point.inside || point.inside.length < 2) return undefined
  const suffix = tour.place_suffix
  return directionsUrl([pointQuery(point, suffix), ...point.inside.map((via) => viaQuery(via, suffix))])
}

export type RoutePart = { url: string; from: number; to: number }

export function fullRouteParts(tour: TourData): RoutePart[] {
  const last = tour.points.length - 1
  if (tour.map_url) return [{ url: tour.map_url, from: 0, to: last }]
  const stops = tour.points.map((point) => pointQuery(point, tour.place_suffix))
  const step = MAX_WAYPOINTS + 1
  const parts: RoutePart[] = []
  for (let from = 0; from < last; from += step) {
    const to = Math.min(from + step, last)
    parts.push({ url: directionsUrl(stops.slice(from, to + 1)), from, to })
  }
  return parts
}
