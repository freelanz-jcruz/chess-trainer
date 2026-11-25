import { AboutButton } from '@/components/Splash';
import { buttonVariants } from "@/components/ui/button"
import { Mail } from 'lucide-react';

export const metadata = { title: 'Créditos · Ajedrez Tutor' };

export default function Credits() {
  return (
    <article className="prose">
      <h1>Créditos</h1>
      <p>
        Ajedrez Tutor es software libre bajo la licencia <a target="_blank" href="https://www.gnu.org/licenses/gpl-3.0.html"><strong>GNU GPL v3 o posterior</strong></a>. Es gratuito, no tiene
        cuentas y tu progreso se guarda solo en este navegador.
      </p>
      <p>
        Para saber cuánta gente la usa, se recogen estadísticas anónimas de visitas con{' '}
        <a target="_blank" href="https://umami.is">Umami</a>: sin cookies ni datos personales, y sin nada de tu progreso.
      </p>
      <p>Idea y diseño de webapp por <a target="_blank" href="https://freelanz.es">freelanz.es</a>, desarrollado con el apoyo de inteligencia artificial (<a target="_blank" href="https://claude.ai">Claude</a> by Anthropic).</p>
      <div className="flex my-5 gap-2">
        <AboutButton />
        <a 
          target="_blank" 
          href="mailto:info@ajedreztutor.com" 
          className={buttonVariants({ variant: "outline", size: "default" })}>
            <Mail /> Contacto
        </a>
      </div>
      <h2>Datos</h2>
      <ul>
        <li>
          Ejercicios: base de datos de problemas de <a href="https://database.lichess.org/#puzzles">Lichess</a>, publicada
          bajo licencia CC0 (dominio público). Gracias a Lichess y a su comunidad.
        </li>
        <li>
          Nombres y códigos de aperturas: catálogo{' '}
          <a href="https://github.com/lichess-org/chess-openings">lichess-org/chess-openings</a> (CC0).
        </li>
        <li>Textos y notas de las lecciones: originales de este proyecto.</li>
      </ul>
      <h2>Software</h2>
      <ul>
        <li>
          <a href="https://stockfishchess.org/">Stockfish</a> (GPL-3), compilado a WebAssembly por{' '}
          <a href="https://github.com/nmrugg/stockfish.js">stockfish.js</a>.
        </li>
        <li>
          <a href="https://github.com/lichess-org/chessground">Chessground</a> (GPL-3) para el tablero.
        </li>
        <li>
          Piezas <em>cburnett</em>, de Colin M. L. Burnett (licencias libres GPL/BSD/GFDL).
        </li>
        <li>
          <a href="https://github.com/jhlywa/chess.js">chess.js</a> (BSD-2) para las reglas.
        </li>
        <li>
          <a href="https://nextjs.org/">Next.js</a> y <a href="https://react.dev/">React</a> (MIT).
        </li>
        <li>
          <a href="https://serwist.pages.dev/">Serwist</a> (MIT) para el funcionamiento sin conexión.
        </li>
      </ul>
      <p className="text-sm text-muted-foreground">Este proyecto no está afiliado a Lichess ni a Stockfish.</p>
    </article>
  );
}
