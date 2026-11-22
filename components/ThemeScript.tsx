import { KEY } from '@/lib/progress/key';
import { DEFAULT_THEME, THEME_COLOR, THEMES } from '@/lib/theme';

/**
 * Aplica el tema guardado antes de que se pinte la página, para que no haya un destello del tema
 * equivocado. Lee el mismo ajuste que la app (settings.theme del progreso); por defecto, azul marino.
 * El gris oscuro ('dark') es la base del CSS y no lleva data-theme.
 */
export default function ThemeScript() {
  const code = `try{var t=${JSON.stringify(DEFAULT_THEME)},c=${JSON.stringify(THEME_COLOR)};try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(KEY)})||'{}').settings;if(s&&${JSON.stringify(THEMES)}.indexOf(s.theme)>=0)t=s.theme}catch(e){}if(t!=='dark')document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',c[t])}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
