import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useRef } from 'preact/hooks'
import type { Tour } from '../data/schema'
import type { GeoState } from '../useGeolocation'

type Props = {
  tour: Tour
  selected: number | undefined
  onSelect: (index: number) => void
  position: GeoState['position']
}

const SELECTED_MIN_ZOOM = 15

type MarkerGroup = { lat: number; lng: number; indices: number[] }

function groupByLocation(tour: Tour): MarkerGroup[] {
  const groups = new Map<string, MarkerGroup>()
  tour.points.forEach(({ lat, lng }, index) => {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`
    const group = groups.get(key) ?? { lat, lng, indices: [] }
    group.indices.push(index)
    groups.set(key, group)
  })
  return [...groups.values()]
}

function markerIcon(group: MarkerGroup, selected: number | undefined): L.DivIcon {
  const label = group.indices.map((index) => index + 1).join(', ')
  const isSelected = selected !== undefined && group.indices.includes(selected)
  return L.divIcon({
    className: '',
    html: `<div class="map-marker${isSelected ? ' selected' : ''}">${label}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

export function TourMap({ tour, selected, onSelect, position }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | undefined>(undefined)
  const markersRef = useRef<L.Marker[]>([])
  const userRef = useRef<{ dot: L.CircleMarker; accuracy: L.Circle } | undefined>(undefined)
  const groups = useMemo(() => groupByLocation(tour), [tour])
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const selectedRef = useRef(selected)
  selectedRef.current = selected

  useEffect(() => {
    const map = L.map(containerRef.current!, { zoomControl: false, attributionControl: true })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)
    const latLngs = tour.points.map(({ lat, lng }) => L.latLng(lat, lng))
    L.polyline(latLngs, { className: 'route-line', interactive: false }).addTo(map)
    markersRef.current = groups.map((group) =>
      L.marker([group.lat, group.lng], { icon: markerIcon(group, undefined), keyboard: true })
        .on('click', () => {
          const current = group.indices.find((index) => index === selectedRef.current)
          const next = current === undefined ? group.indices[0] : group.indices[(group.indices.indexOf(current) + 1) % group.indices.length]
          onSelectRef.current(next)
        })
        .addTo(map),
    )
    map.fitBounds(L.latLngBounds(latLngs), { padding: [24, 24] })
    mapRef.current = map
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(containerRef.current!)
    return () => {
      observer.disconnect()
      map.remove()
      userRef.current = undefined
    }
  }, [tour, groups])

  useEffect(() => {
    groups.forEach((group, index) => markersRef.current[index]?.setIcon(markerIcon(group, selected)))
    if (selected === undefined || !mapRef.current) return
    const { lat, lng } = tour.points[selected]
    mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), SELECTED_MIN_ZOOM))
  }, [selected, groups, tour])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!position) {
      userRef.current?.dot.remove()
      userRef.current?.accuracy.remove()
      userRef.current = undefined
      return
    }
    const latLng = L.latLng(position.lat, position.lng)
    if (userRef.current) {
      userRef.current.dot.setLatLng(latLng)
      userRef.current.accuracy.setLatLng(latLng).setRadius(position.accuracy)
      return
    }
    userRef.current = {
      accuracy: L.circle(latLng, { radius: position.accuracy, className: 'user-accuracy', interactive: false }).addTo(map),
      dot: L.circleMarker(latLng, { radius: 7, className: 'user-dot', interactive: false }).addTo(map),
    }
  }, [position])

  return <div ref={containerRef} class="tour-map" />
}
