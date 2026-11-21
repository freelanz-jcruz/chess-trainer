import { describe, expect, it } from 'vitest';
import { parseBestMove, parseInfo } from '@/lib/engine/uci';
import { assessMove, scoreToPawns } from '@/lib/engine/evaluate';
import { scoreForMover } from '@/lib/engine/evaluate-move';

describe('parseInfo', () => {
  it('lee cp, mate, multipv y pv', () => {
    const a = parseInfo('info depth 12 seldepth 18 multipv 1 score cp -32 nodes 1000 nps 1 pv e7e5 g1f3');
    expect(a).toEqual({ depth: 12, multipv: 1, score: { type: 'cp', value: -32 }, pv: ['e7e5', 'g1f3'] });
    const b = parseInfo('info depth 5 score mate -2 upperbound pv a1a8');
    expect(b?.score).toEqual({ type: 'mate', value: -2 });
    expect(parseInfo('info string NNUE loaded')).toBeNull();
  });
  it('lee bestmove', () => {
    expect(parseBestMove('bestmove e2e4 ponder e7e5')).toBe('e2e4');
    expect(parseBestMove('bestmove (none)')).toBeNull();
  });
});

describe('assessMove (tabla de valoración)', () => {
  const cp = (v: number) => ({ type: 'cp', value: v }) as const;
  const mate = (v: number) => ({ type: 'mate', value: v }) as const;
  it('clasifica por pérdida en peones', () => {
    expect(assessMove(cp(50), cp(20)).verdict).toBe('good');
    expect(assessMove(cp(50), cp(-10)).verdict).toBe('inaccuracy');
    expect(assessMove(cp(50), cp(-50)).verdict).toBe('mistake');
    expect(assessMove(cp(50), cp(-250)).verdict).toBe('mistake');
    expect(assessMove(cp(50), cp(-260)).verdict).toBe('blunder');
  });
  it('permitir mate es error grave aunque la pérdida numérica sea pequeña', () => {
    expect(assessMove(mate(-5), mate(-3)).verdict).toBe('good'); // ya estaba perdido
    expect(assessMove(mate(2), mate(4)).verdict).toBe('good'); // sigue dando mate
    expect(assessMove(cp(-1400), mate(-8)).verdict).toBe('blunder');
  });
  it('no inventa pérdidas en posiciones ya ganadas', () => {
    expect(assessMove(cp(2500), cp(1800)).verdict).toBe('good');
  });
  it('perder un mate forzado quedando muy por delante no es error', () => {
    expect(scoreToPawns(mate(2))).toBe(98);
    expect(assessMove(mate(2), cp(900)).verdict).toBe('blunder'); // 98 -> 9 peones
  });
  it('no da cifras cuando hay un mate de por medio', () => {
    expect(assessMove(mate(1), cp(300))).toMatchObject({ verdict: 'blunder', loss: null, reason: 'missesMate' });
    expect(assessMove(cp(50), mate(-2))).toMatchObject({ verdict: 'blunder', loss: null, reason: 'allowsMate' });
    expect(assessMove(cp(50), cp(-10)).loss).toBe(0.6);
  });
  it('dar mate cuenta como lo mejor', () => {
    const after = scoreForMover({ bestMove: null, score: mate(0), pv: [], depth: 0 });
    expect(assessMove(mate(1), after).verdict).toBe('good');
  });
});
