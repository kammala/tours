import { render } from 'preact'
import { registerSW } from 'virtual:pwa-register'
import { lang } from './i18n'
import { Home } from './pages/Home'
import { Tour } from './pages/Tour'
import { route } from './router'
import './styles.css'

function App() {
  document.documentElement.lang = lang.value
  const tourMatch = route.value.match(/^tour\/([^/]+\/[^/]+)(?:\/(\d+))?$/)
  if (!tourMatch) return <Home />
  const [, id, pointNumber] = tourMatch
  return <Tour key={id} id={id} initialPoint={pointNumber ? Number(pointNumber) - 1 : undefined} />
}

registerSW({ immediate: true })
render(<App />, document.getElementById('app')!)
