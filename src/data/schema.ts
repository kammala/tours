import { z } from 'zod'

export const LANGS = ['en', 'ru'] as const
export type Lang = (typeof LANGS)[number]

const text = z.string().trim().min(1)

const localized = z
  .object({ en: text.optional(), ru: text.optional() })
  .strict()
  .refine((value) => value.en !== undefined || value.ru !== undefined, 'needs at least one of en/ru')

const coords = { lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }

const via = z.union([text, z.object(coords).strict()])

const minutes = z.union([z.number().positive(), z.tuple([z.number().positive(), z.number().positive()])])

const point = z
  .object({
    name: localized,
    place: text.optional(),
    ...coords,
    radius_m: z.number().positive().optional(),
    approach: z.array(via).max(9).optional(),
    inside: z.array(via).min(1).max(10).optional(),
    walk_min: minutes.optional(),
    visit_min: minutes.optional(),
    short: localized.optional(),
    long: localized.optional(),
  })
  .strict()

export const tourSchema = z
  .object({
    country: localized,
    city: localized,
    name: localized,
    place_suffix: text.optional(),
    intro: localized.optional(),
    outro: localized.optional(),
    summary: localized.optional(),
    map_url: z.url().optional(),
    points: z.array(point).min(2),
  })
  .strict()

export type Localized = z.infer<typeof localized>
export type Via = z.infer<typeof via>
export type Minutes = z.infer<typeof minutes>
export type Point = z.infer<typeof point>
export type TourData = z.infer<typeof tourSchema>
export type Tour = TourData & { id: string; countryId: string }
