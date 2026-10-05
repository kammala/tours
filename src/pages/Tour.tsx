import { useEffect, useRef, useState } from 'preact/hooks'
import tours from 'virtual:tours'
import { LangSwitch } from '../components/LangSwitch'
import { Markdown } from '../components/Markdown'
import { PointCard } from '../components/PointCard'
import { TourMap } from '../components/TourMap'
import { autoSelect, formatDistance, nearestPoint } from '../geo'
import { fullRouteParts } from '../gmaps'
import { pick, t } from '../i18n'
import { useGeolocation } from '../useGeolocation'

function scrollToPoint(index: number) {
  document.getElementById(`point-${index}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

export function Tour({ id, initialPoint }: { id: string; initialPoint?: number }) {
  const tour = tours.find((candidate) => candidate.id === id)
  const [selected, setSelected] = useState(initialPoint)
  const [following, setFollowing] = useState(false)
  const [mapOpen, setMapOpen] = useState(true)
  const geo = useGeolocation(following)
  const lastSuggestion = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!tour || !geo.position) return
    const suggestion = autoSelect(tour.points, geo.position, selected)
    if (suggestion === lastSuggestion.current) return
    lastSuggestion.current = suggestion
    if (suggestion === undefined || suggestion === selected) return
    setSelected(suggestion)
    requestAnimationFrame(() => scrollToPoint(suggestion))
  }, [geo.position, tour])

  useEffect(() => {
    if (!following) lastSuggestion.current = undefined
  }, [following])

  useEffect(() => {
    if (initialPoint !== undefined) requestAnimationFrame(() => scrollToPoint(initialPoint))
  }, [])

  if (!tour) {
    return (
      <main class="not-found">
        <p>{t('notFound')}</p>
        <a href="#/">{t('back')}</a>
      </main>
    )
  }

  const routeParts = fullRouteParts(tour)
  const nearest = geo.position && nearestPoint(tour.points, geo.position)
  const intro = pick(tour.intro)
  const outro = pick(tour.outro)

  const selectFromMap = (index: number) => {
    setSelected(index)
    scrollToPoint(index)
  }

  return (
    <>
      <header class="app-header">
        <a class="back" href="#/" aria-label={t('back')}>
          ‹
        </a>
        <div class="header-title">
          <h1>{pick(tour.name)}</h1>
          <p>
            {pick(tour.city)}, {pick(tour.country)}
            {tour.summary && ` · ${pick(tour.summary)}`}
          </p>
        </div>
        <LangSwitch />
      </header>
      <div class={`map-wrap${mapOpen ? '' : ' collapsed'}`}>
        {mapOpen && <TourMap tour={tour} selected={selected} onSelect={selectFromMap} position={geo.position} />}
        <button type="button" class="map-toggle" aria-expanded={mapOpen} onClick={() => setMapOpen(!mapOpen)}>
          {mapOpen ? '▴' : '▾ 🗺'}
        </button>
      </div>
      <main class="tour">
        {intro && (
          <details class="tour-text">
            <summary>{t('about')}</summary>
            <Markdown text={intro} />
          </details>
        )}
        <ol class="point-list">
          {tour.points.map((_, index) => (
            <PointCard key={index} tour={tour} index={index} selected={selected === index} onSelect={setSelected} />
          ))}
        </ol>
        {outro && <Markdown class="tour-text" text={outro} />}
      </main>
      <footer class="action-bar">
        {following && (
          <p class="geo-status" aria-live="polite">
            {geo.error && t('geoDenied')}
            {nearest &&
              !geo.error &&
              `${t('nearest')}: ${nearest.index + 1}. ${pick(tour.points[nearest.index].name)} · ${formatDistance(nearest.distance, { m: t('m'), km: t('km') })}`}
          </p>
        )}
        <div class="action-row">
          <button type="button" class={`button locate${following ? ' primary' : ''}`} aria-pressed={following} onClick={() => setFollowing(!following)}>
            📍 {following ? t('locating') : t('locateMe')}
          </button>
          {routeParts.map(({ url, from, to }) => (
            <a key={url} class="button" href={url} target="_blank" rel="noopener">
              🗺 {routeParts.length === 1 ? t('fullRoute') : `${from + 1}–${to + 1}`}
            </a>
          ))}
        </div>
      </footer>
    </>
  )
}
