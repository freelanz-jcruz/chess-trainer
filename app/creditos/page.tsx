import { Mail } from 'lucide-react';
import { AboutButton } from '@/components/About';
import { buttonVariants } from '@/components/ui/button';
import { DEFAULT_LOCALE, getMessages } from '@/lib/i18n';
import { Fill } from '@/lib/i18n/bold';

const t = getMessages(DEFAULT_LOCALE);
const tc = t.credits;

export const metadata = { title: t.meta.pageTitle(tc.title) };

/** Enlace externo que se abre en otra pestaña. */
const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a target="_blank" href={href}>
    {children}
  </a>
);

export default function Credits() {
  return (
    <article className="prose">
      <h1>{tc.title}</h1>
      <p>
        <Fill
          text={tc.license}
          values={{
            appName: t.appName,
            license: (
              <Ext href="https://www.gnu.org/licenses/gpl-3.0.html">
                <strong>{tc.licenseName}</strong>
              </Ext>
            ),
          }}
        />
      </p>
      <p>
        <Fill text={tc.stats} values={{ umami: <Ext href="https://umami.is">Umami</Ext> }} />
      </p>
      <p>
        <Fill
          text={tc.authors}
          values={{
            freelanz: <Ext href="https://freelanz.es">freelanz.es</Ext>,
            claude: <Ext href="https://claude.ai">Claude</Ext>,
          }}
        />
      </p>
      <div className="flex my-5 gap-2">
        <AboutButton />
        <a target="_blank" href="mailto:info@ajedreztutor.com" className={buttonVariants({ variant: 'outline', size: 'default' })}>
          <Mail /> {tc.contact}
        </a>
      </div>
      <h2>{tc.data}</h2>
      <ul>
        <li>
          <Fill text={tc.dataPuzzles} values={{ lichess: <a href="https://database.lichess.org/#puzzles">Lichess</a> }} />
        </li>
        <li>
          <Fill
            text={tc.dataOpenings}
            values={{ catalog: <a href="https://github.com/lichess-org/chess-openings">lichess-org/chess-openings</a> }}
          />
        </li>
        <li>{tc.dataLessons}</li>
      </ul>
      <h2>{tc.software}</h2>
      <ul>
        <li>
          <Fill
            text={tc.stockfish}
            values={{
              stockfish: <a href="https://stockfishchess.org/">Stockfish</a>,
              stockfishjs: <a href="https://github.com/nmrugg/stockfish.js">stockfish.js</a>,
            }}
          />
        </li>
        <li>
          <Fill text={tc.chessground} values={{ chessground: <a href="https://github.com/lichess-org/chessground">Chessground</a> }} />
        </li>
        <li>
          <Fill text={tc.pieces} values={{ cburnett: <em>cburnett</em> }} />
        </li>
        <li>
          <Fill text={tc.chessjs} values={{ chessjs: <a href="https://github.com/jhlywa/chess.js">chess.js</a> }} />
        </li>
        <li>
          <Fill
            text={tc.next}
            values={{ next: <a href="https://nextjs.org/">Next.js</a>, react: <a href="https://react.dev/">React</a> }}
          />
        </li>
        <li>
          <Fill text={tc.serwist} values={{ serwist: <a href="https://serwist.pages.dev/">Serwist</a> }} />
        </li>
      </ul>
      <p className="text-sm text-muted-foreground">{tc.notAffiliated}</p>
    </article>
  );
}
