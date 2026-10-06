import type { Tour, Via } from '../data/schema'
import { formatMinutes } from '../geo'
import { legUrl, viaLabel } from '../gmaps'
import { pick, t } from '../i18n'
import { Markdown } from './Markdown'

type Props = {
  tour: Tour
  index: number
  selected: boolean
  onSelect: (index: number | undefined) => void
}

function pathText(stops: Via[]): string {
  return stops.map(viaLabel).join(' → ')
}

export function PointCard({ tour, index, selected, onSelect }: Props) {
  const point = tour.points[index]
  const name = pick(point.name)
  const previous = tour.points[index - 1]
  const leg = legUrl(tour, index)
  const short = pick(point.short)
  const long = pick(point.long)
  const toggle = () => onSelect(selected ? undefined : index)

  return (
    <li id={`point-${index}`} class={`point-card${selected ? ' selected' : ''}`}>
      <button type="button" class="point-head" aria-expanded={selected} onClick={toggle}>
        <span class="point-number">{index + 1}</span>
        <span class="point-title">
          <span class="point-name">{name}</span>
          <span class="point-meta">
            {index === 0 && t('start')}
            {point.walk_min !== undefined && `🚶 ${formatMinutes(point.walk_min)} ${t('min')}`}
            {point.visit_min !== undefined && ` · 👀 ${formatMinutes(point.visit_min)} ${t('min')}`}
          </span>
        </span>
      </button>
      {short && (
        <div class="point-short-toggle" onClick={(event) => (event.target as Element).closest('a') || toggle()}>
          <Markdown class="point-short" text={short} />
        </div>
      )}
      {selected && (
        <div class="point-details">
          {previous && point.approach && (
            <p class="point-path">{pathText([pick(previous.name), ...point.approach, name])}</p>
          )}
          {point.inside && <p class="point-path">↻ {pathText([name, ...point.inside])}</p>}
          {long && <Markdown class="point-long" text={long} />}
          {leg && (
            <div class="point-actions">
              <a class="button primary" href={leg} target="_blank" rel="noopener">
                {t('routeHere')}
              </a>
            </div>
          )}
        </div>
      )}
    </li>
  )
}
