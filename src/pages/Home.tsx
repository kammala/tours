import tours from 'virtual:tours'
import { LangSwitch } from '../components/LangSwitch'
import type { Tour } from '../data/schema'
import { totalWalkMinutes } from '../geo'
import { pick, t } from '../i18n'
import { tourHref } from '../router'

function groupBy<T>(items: T[], key: (item: T) => string): [string, T[]][] {
  const groups = new Map<string, T[]>()
  items.forEach((item) => groups.set(key(item), [...(groups.get(key(item)) ?? []), item]))
  return [...groups.entries()]
}

function TourLink({ tour }: { tour: Tour }) {
  const [min, max] = totalWalkMinutes(tour.points)
  const summary = pick(tour.summary) || `🚶 ${min === max ? min : `${min}–${max}`} ${t('min')}`
  return (
    <li>
      <a class="tour-link" href={tourHref(tour.id)}>
        <span class="tour-link-name">{pick(tour.name)}</span>
        <span class="tour-link-meta">
          {tour.points.length} {t('points')} · {summary}
        </span>
      </a>
    </li>
  )
}

export function Home() {
  const countries = groupBy(tours, (tour) => tour.countryId)
  return (
    <>
      <header class="app-header">
        <h1>{t('tours')}</h1>
        <LangSwitch />
      </header>
      <main class="home">
        {countries.map(([countryId, countryTours]) => (
          <details key={countryId} class="country" open>
            <summary>{pick(countryTours[0].country)}</summary>
            {groupBy(countryTours, (tour) => pick(tour.city, 'en')).map(([cityKey, cityTours]) => (
              <section key={cityKey} class="city">
                <h3>{pick(cityTours[0].city)}</h3>
                <ul class="tour-list">
                  {cityTours.map((tour) => (
                    <TourLink key={tour.id} tour={tour} />
                  ))}
                </ul>
              </section>
            ))}
          </details>
        ))}
      </main>
    </>
  )
}
