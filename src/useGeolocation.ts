import { useEffect, useState } from 'preact/hooks'
import type { LatLng } from './geo'

export type GeoState = { position?: LatLng & { accuracy: number }; error?: boolean }

export function useGeolocation(enabled: boolean): GeoState {
  const [state, setState] = useState<GeoState>({})
  useEffect(() => {
    if (!enabled) {
      setState({})
      return
    }
    if (!('geolocation' in navigator)) {
      setState({ error: true })
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => setState({ position: { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy } }),
      () => setState({ error: true }),
      { enableHighAccuracy: true, maximumAge: 10_000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [enabled])
  return state
}
