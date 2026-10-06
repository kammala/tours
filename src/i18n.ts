import { signal } from '@preact/signals'
import { LANGS, type Lang, type Localized } from './data/schema'

const STORAGE_KEY = 'mamotour.lang'

const STRINGS = {
  en: {
    tours: 'Tours',
    points: 'points',
    min: 'min',
    walk: 'walk',
    visit: 'visit',
    routeHere: 'Route here',
    fullRoute: 'Full route',
    locateMe: 'Locate me',
    locating: 'Following you',
    nearest: 'Nearest point',
    away: 'away',
    geoDenied: 'Location unavailable',
    start: 'Start',
    about: 'About this tour',
    notFound: 'Tour not found',
    back: 'Back',
    more: 'More',
    m: 'm',
    km: 'km',
  },
  ru: {
    tours: 'Маршруты',
    points: 'точек',
    min: 'мин',
    walk: 'пешком',
    visit: 'осмотр',
    routeHere: 'Маршрут сюда',
    fullRoute: 'Весь маршрут',
    locateMe: 'Где я?',
    locating: 'Слежу за вами',
    nearest: 'Ближайшая точка',
    away: '',
    geoDenied: 'Геопозиция недоступна',
    start: 'Старт',
    about: 'О маршруте',
    notFound: 'Маршрут не найден',
    back: 'Назад',
    more: 'Подробнее',
    m: 'м',
    km: 'км',
  },
} satisfies Record<Lang, Record<string, string>>

export type StringKey = keyof (typeof STRINGS)['en']

function readStoredLang(): Lang | undefined {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return LANGS.find((lang) => lang === stored)
  } catch {
    return undefined
  }
}

function detectLang(): Lang {
  return navigator.languages.some((tag) => /^(ru|uk|be|kk)\b/i.test(tag)) ? 'ru' : 'en'
}

export const lang = signal<Lang>(readStoredLang() ?? detectLang())

export function setLang(next: Lang) {
  lang.value = next
  document.documentElement.lang = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {}
}

export function t(key: StringKey): string {
  return STRINGS[lang.value][key]
}

export function pick(value: Localized | undefined, preferred: Lang = lang.value): string {
  if (!value) return ''
  return value[preferred] ?? value[preferred === 'en' ? 'ru' : 'en'] ?? ''
}
