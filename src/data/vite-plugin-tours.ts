import { readFileSync, readdirSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import type { Plugin } from 'vite'
import { parse } from 'yaml'
import { z } from 'zod'
import { tourSchema, type Tour } from './schema.ts'

const VIRTUAL_ID = 'virtual:tours'
const RESOLVED_ID = `\0${VIRTUAL_ID}`

function findYamlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return findYamlFiles(path)
    return /\.ya?ml$/.test(entry.name) ? [path] : []
  })
}

export function loadTours(dir: string): Tour[] {
  return findYamlFiles(dir)
    .sort()
    .map((file) => {
      const id = relative(dir, file).replace(/\.ya?ml$/, '').split(sep).join('/')
      const result = tourSchema.safeParse(parse(readFileSync(file, 'utf8')))
      if (!result.success) {
        throw new Error(`Invalid tour ${relative(process.cwd(), file)}:\n${z.prettifyError(result.error)}`)
      }
      return { ...result.data, id, countryId: id.split('/')[0] }
    })
}

export function toursPlugin(dir: string): Plugin {
  return {
    name: 'mamotour-tours',
    resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : undefined),
    load(id) {
      if (id !== RESOLVED_ID) return
      findYamlFiles(dir).forEach((file) => this.addWatchFile(file))
      return `export default ${JSON.stringify(loadTours(dir))}`
    },
    configureServer(server) {
      server.watcher.add(dir)
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(dir)) return
        const module = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (module) server.moduleGraph.invalidateModule(module)
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}
