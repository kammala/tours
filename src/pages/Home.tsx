import type { ComponentChildren } from 'preact'
import { useState } from 'preact/hooks'
import tours from 'virtual:tours'
import { LangSwitch } from '../components/LangSwitch'
import type { Tour } from '../data/schema'
import { totalWalkMinutes } from '../geo'
import { pick, t } from '../i18n'
import { tourHref } from '../router'
import { persistedSet } from '../storage'

const collapsed = persistedSet('mamotour.collapsed')
const hidden = persistedSet('mamotour.hidden')

function groupBy<T>(items: T[], key: (item: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>()
  items.forEach((item) => groups.set(key(item), [...(groups.get(key(item)) ?? []), item]))
  return [...groups.entries()]
}

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {crossed && <path d="M4 4l16 16" />}
    </svg>
  )
}

function HideButton({ ids }: { ids: string[] }) {
  const isHidden = ids.every((id) => hidden.items.value.has(id))
  return (
    <button
      type="button"
      class="eye"
      aria-label={t(isHidden ? 'unhide' : 'hide')}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        hidden.set(ids, !isHidden)
      }}
    >
      <EyeIcon crossed={isHidden} />
    </button>
  )
}

function Section({ id, class: className, summary, children }: { id: string; class: string; summary: ComponentChildren; children: ComponentChildren }) {
  return (
    <details class={className} open={!collapsed.items.value.has(id)} onToggle={(event) => collapsed.set([id], !event.currentTarget.open)}>
      <summary>{summary}</summary>
      {children}
    </details>
  )
}

function TourLink({ tour }: { tour: Tour }) {
  const [min, max] = totalWalkMinutes(tour.points)
  const summary = pick(tour.summary) || `🚶 ${min === max ? min : `${min}–${max}`} ${t('min')}`
  return (
    <li class={hidden.items.value.has(tour.id) ? 'tour-row hidden' : 'tour-row'}>
      <a class="tour-link" href={tourHref(tour.id)}>
        <span class="tour-link-name">{pick(tour.name)}</span>
        <span class="tour-link-meta">
          {tour.points.length} {t('points')} · {summary}
        </span>
      </a>
      <HideButton ids={[tour.id]} />
    </li>
  )
}

export function Home() {
  const [showHidden, setShowHidden] = useState(false)
  const hiddenCount = tours.filter((tour) => hidden.items.value.has(tour.id)).length
  const shown = showHidden ? tours : tours.filter((tour) => !hidden.items.value.has(tour.id))
  return (
    <>
      <header class="app-header">
        <h1>{t('tours')}</h1>
        {hiddenCount > 0 && (
          <button type="button" class="show-hidden" aria-label={t('showHidden')} aria-pressed={showHidden} onClick={() => setShowHidden(!showHidden)}>
            <EyeIcon crossed={!showHidden} /> {hiddenCount}
          </button>
        )}
        <LangSwitch />
      </header>
      <main class="home">
        {groupBy(shown, (tour) => tour.countryId).map(([countryId, countryTours]) => (
          <Section key={countryId} id={countryId} class="country" summary={pick(countryTours[0].country)}>
            {groupBy(countryTours, (tour) => pick(tour.city, 'en')).map(([cityKey, cityTours]) => (
              <Section
                key={cityKey}
                id={`${countryId}/${cityKey}`}
                class="city"
                summary={
                  <>
                    <h3>{pick(cityTours[0].city)}</h3>
                    <HideButton ids={cityTours.map((tour) => tour.id)} />
                  </>
                }
              >
                <ul class="tour-list">
                  {cityTours.map((tour) => (
                    <TourLink key={tour.id} tour={tour} />
                  ))}
                </ul>
              </Section>
            ))}
          </Section>
        ))}
      </main>
    </>
  )
}
