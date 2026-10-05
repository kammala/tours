import { LANGS } from '../data/schema'
import { lang, setLang } from '../i18n'

export function LangSwitch() {
  return (
    <div class="lang-switch" role="group" aria-label="Language">
      {LANGS.map((code) => (
        <button key={code} type="button" aria-pressed={lang.value === code} onClick={() => setLang(code)}>
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
