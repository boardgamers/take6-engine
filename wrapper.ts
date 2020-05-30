import assert from "assert";
import type {GameState} from "./index";
import { Move } from "./src/move";
import * as engine from "./src/engine";
import { GameEventName } from "./src/log";
import { asserts } from "./src/utils";
import type { LogEvent, LogMove, GameEvents } from './src/log';
import { uniq } from "lodash";

export async function init (nbPlayers: number, expansions: string[], options: {}, seed?: string): Promise<GameState> {
  return engine.setup(nbPlayers, options, seed);
}

export function setPlayerMetaData(G: GameState, player: number, metaData: {name: string}) {
  G.players[player].name = metaData.name;

  return G;
}

export async function move(G: GameState, move: Move, player: number) {
  const index = G.log.length;

  G = engine.move(G, move, player);

  G = automove(G);

  for (const roundEvent of G.log.slice(index).filter(item => item.type === "event" && item.event.name === GameEventName.RoundStart)) {
    asserts<LogEvent> (roundEvent);
    const eventData = roundEvent.event;
    asserts<GameEvents.RoundStart> (eventData);
    (G as any).messages = [...((G as any).messages || []), `Round ${eventData.round}`];
  }

  return G;
}

function automove(G: GameState) {
  while (G.players.some(pl => pl.isAI && pl.availableMoves)) {
    G = engine.moveAI(G, G.players.findIndex(pl => pl.isAI && pl.availableMoves));
  }

  return G;
}

export { ended } from './src/engine';

/**
 * We give 0 to the last player, 1 to the player before last, ...
 * @param G
 */
export function scores (G: GameState) {
  const sortedPoints = uniq(G.players.map(pl => pl.points)).sort();

  return G.players.map(pl => sortedPoints.indexOf(pl.points));
}

export function replay (G: GameState) {
  const oldPlayers = G.players;

  const oldG = G;

  G = engine.setup(G.players.length, G.options, G.seed);

  for (let i = 0; i < oldPlayers.length && i < G.players.length; i++) {
    G.players[i].name = oldPlayers[i].name;
    G.players[i].isAI = oldPlayers[i].isAI;
  }

  for (const move of oldG.log.filter(event => event.type === "move")) {
    asserts<LogMove>(move);

    G = engine.move(G, move.move, move.player);
  }

  G = automove(G);

  return G;
}

export function round (G: GameState) {
  return G.round;
}

export async function dropPlayer (G: GameState, player: number) {
  G.players[player].isAI = true;

  return automove(G);
}

export function currentPlayer (G: GameState) {
  return G.players.map((pl, i) => pl.availableMoves ? i : -1).filter(i => i !== -1);
}

export { stripSecret } from './src/engine';

export function messages (G: GameState) {
  const messages = (G as any).messages || [];
  delete (G as any).messages;

  return {
    messages,
    data: G
  };
}

export function logLength (G: GameState, player?: number) {
  return G.log.length;
}

export function logSlice (G: GameState, options?: {player?: number; start?: number; end?: number}) {
  const stripped = engine.stripSecret(G, options?.player);
  return {
    log: stripped.log.slice(options?.start, options?.end),
    availableMoves: options.end === undefined ?
      stripped.players.map(pl => pl.availableMoves) :
      engine.stripSecret(replay({...G, log: G.log.slice(0, options.end)}), options.player).players.map(pl => pl.availableMoves)
  };
}
