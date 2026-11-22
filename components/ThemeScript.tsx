import { KEY } from '@/lib/progress/key';

/**
 * Aplica el tema guardado antes de que se pinte la página, para que no haya un destello del tema
 * equivocado. Lee el mismo ajuste que la app (settings.theme del progreso); por defecto, oscuro.
 */
export default function ThemeScript() {
  const code = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(KEY)})||'{}').settings;if(s&&s.theme==='light'){document.documentElement.dataset.theme='light';var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content','#f6f3ee')}}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
