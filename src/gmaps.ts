import type { Point, TourData, Via } from './data/schema'

const DIR_BASE = 'https://www.google.com/maps/dir/?api=1&travelmode=walking'
export const MAX_WAYPOINTS = 9

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

export function directionsUrl(stops: string[]): string {
  const params = new URLSearchParams({ origin: stops[0], destination: stops[stops.length - 1] })
  if (stops.length > 2) params.set('waypoints', stops.slice(1, -1).join('|'))
  return `${DIR_BASE}&${params}`
}

export function navigateUrl(tour: TourData, index: number): string {
  const params = new URLSearchParams({ destination: pointQuery(tour.points[index], tour.place_suffix) })
  return `${DIR_BASE}&${params}`
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
