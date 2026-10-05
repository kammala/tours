import type { Point, TourData } from '../src/data/schema'

export function point(name: string, lat: number, lng: number, extra: Partial<Point> = {}): Point {
  return { name: { en: name }, lat, lng, ...extra }
}

export function tour(points: Point[], extra: Partial<TourData> = {}): TourData {
  return { country: { en: 'Belgium' }, city: { en: 'Ghent' }, name: { en: 'Loop' }, place_suffix: 'Gent', points, ...extra }
}

export const START = point('Start', 51.0466, 3.7273, { place: 'Viernulvier, Sint-Pietersnieuwstraat 23, Gent' })
export const KORENMARKT = point('Korenmarkt', 51.0546, 3.7214)
export const GRAVENSTEEN = point('Gravensteen', 51.0573, 3.7208)
export const VRIJDAGMARKT = point('Vrijdagmarkt', 51.0569, 3.7259)

export const LOOP = [START, KORENMARKT, GRAVENSTEEN, VRIJDAGMARKT, KORENMARKT, START]
