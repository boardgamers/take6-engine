import assert from "assert";
import seedrandom from "seedrandom";
import { GameOptions, Phase, GameState, Card, Player } from "./gamestate";
import { getCard } from "./card";
import { availableMoves } from "./available-moves";
import { isEqual, sumBy } from "lodash";
import { Move, MoveName } from "./move";
import type { Moves } from "./move";
import { asserts, shuffle } from "./utils";
import { GameEventName } from "./log";

export function setup(numPlayers: number, {pro = false, points = 66, handSize = 10}: GameOptions, seed?: string): GameState {
  const rng = seedrandom(seed || Math.random().toString());

  const cards = shuffle(new Array(104).fill(0).map((x, i) => getCard(i + 1)), rng() + '');

  const rows: [Card[],Card[],Card[],Card[]] = new Array(4).fill(0).map(() => [cards.shift()]) as [Card[],Card[],Card[],Card[]];

  const players: Player[] = new Array(numPlayers).fill(0).map(() => ({
    hand: cards.splice(0, handSize),
    points: 0,
    discard: [],
    faceDownCard: null,
    availableMoves: null,
    isAI: false
  }));

  const G: GameState = {
    players,
    rows,
    options: {pro, points, handSize},
    phase: Phase.ChooseCard,
    log: [],
    round: 1,
    seed,
  } as GameState;

  for (const player of G.players) {
    player.availableMoves = availableMoves(G, player);
  }

  G.log.push({type: "event", event: {name: GameEventName.GameStart}});

  addRoundStart(G);

  return G;
}

function addRoundStart(G: GameState) {
  G.log.push({
    type: "event",
    event: {
      name: GameEventName.RoundStart,
      cards: {players: G.players.map(player => [...player.hand]), board: G.rows.map(row => row[0])},
      round: G.round
    }
  });
}

export function stripSecret(G: GameState, player?: number): GameState {
  return {
    ...G,
    seed: "secret",
    players: G.players.map((pl, i) => {
      if (player === i) {
        return pl;
      } else {
        return {
          ...pl,
          hand: pl.hand.map(() => ({number: 0, points: 0})),
          availableMoves: pl.availableMoves ? {} : null,
          faceDownCard: pl.faceDownCard ? (G.phase === Phase.PlaceCard ? pl.faceDownCard  : {number: 0, points: 0}) : null
        };
      }
    }),
    log: G.log.map(item => {
      if (item.type === "move" && item.player !== player && item.move.name === MoveName.ChooseCard) {
        // Hide facedown cards in log
        return {...item, move: {...item.move, data: {number: 0, points: 0}}};
      } else if (item.type === "event" && item.event.name === GameEventName.RoundStart) {
        return {
          ...item,
          event: {
            ...item.event,
            cards: {
              ...item.event.cards,
              players: item.event.cards.players.map((cards, i) => i === player ? cards : cards.map(() => ({points: 0, number: 0})))
            }
          }
        };
      }
      return item;
    })
  };
}

export function currentPlayers(G: GameState): number[] {
  switch (G.phase) {
    case Phase.ChooseCard: {
      const minCards = Math.min(...G.players.map(pl => pl.hand.length));
      return G.players.map((pl, i) => ({...pl, i})).filter(pl => pl.hand.length > minCards).map(pl => pl.i);
    }
    case Phase.PlaceCard:
    default: {
      return [];
    }
  }
}

export function move(G: GameState, move: Move, playerNumber: number): GameState {
  const player = G.players[playerNumber];
  const available = player.availableMoves?.[move.name];

  assert(available, "You are not allowed to run the command " + move.name);
  assert(available.some((x: Card | {row: number; replace: boolean}) => isEqual(x, move.data)), "Wrong argument for the command " + move.name);

  G.log.push({type: "move", player: playerNumber, move});

  switch (move.name) {
    case MoveName.ChooseCard: {
      // Should not be needed, typescript should make the distinction itself
      asserts<Moves.MoveChooseCard>(move);
      player.faceDownCard = move.data;
      player.hand.splice(player.hand.findIndex(c => isEqual(c, move.data)), 1);
      delete player.availableMoves;

      if (G.players.every(pl => pl.faceDownCard)) {
        G.phase = Phase.PlaceCard;

        G.log.push({type: "event", event: {name: GameEventName.RevealCards, cards: G.players.map(pl => pl.faceDownCard!)}});

        G = switchToNextPlayer(G);
      }

      return G;
    }
    case MoveName.PlaceCard: {
      delete player.availableMoves;

      if (move.data.replace) {
        player.discard.push(...G.rows[move.data.row]);
        player.points = sumBy(player.discard, "points");
        G.rows[move.data.row] = [player.faceDownCard!];
      } else {
        G.rows[move.data.row].push(player.faceDownCard!);
      }

      delete player.faceDownCard;

      return switchToNextPlayer(G);
    }
  }
}

export function moveAI(G: GameState, playerNumber: number): GameState {
  if (G.players[playerNumber].availableMoves!.chooseCard) {
    const avail = G.players[playerNumber].availableMoves!.chooseCard!;
    return move(G, {name: MoveName.ChooseCard, data: avail[Math.floor(Math.random() * avail.length)]}, playerNumber);
  }
  if (G.players[playerNumber].availableMoves!.placeCard) {
    const avail = G.players[playerNumber].availableMoves!.placeCard!;
    return move(G, {name: MoveName.PlaceCard, data: avail[Math.floor(Math.random() * avail.length)]}, playerNumber);
  }
  return G;
}

function switchToNextPlayer(G: GameState): GameState {
  if (ended(G)) {
    return G;
  }

  if (G.players.every(pl => !pl.faceDownCard)) {
    if (G.players.every(pl => pl.hand.length === 0)) {
      G.round ++;

      const configuration = setup(G.players.length, G.options, G.seed ? G.seed + JSON.stringify(G) : G.round + G.seed);

      for (let i = 0; i < G.players.length; i++) {
        G.players[i].hand = configuration.players[i].hand;
      }

      G.rows = configuration.rows;
      G.phase = configuration.phase;

      addRoundStart(G);
    }

    G.phase = Phase.ChooseCard;

    for (const player of G.players) {
      player.availableMoves = availableMoves(G, player);
    }

    return G;
  }

  const player = G.players.find(pl => pl.faceDownCard?.number === Math.min(...G.players.filter(pl => pl.faceDownCard).map(pl => pl.faceDownCard!.number)))!;

  player.availableMoves = availableMoves(G, player);

  return G;
}

export function ended(G: GameState): boolean {
  return G.players.every(pl => !pl.faceDownCard && pl.hand.length === 0) && G.players.some(pl => pl.points >= G.options.points!);
}

export function scores(G: GameState): number[] {
  return G.players.map(pl => sumBy(pl.discard, "points"));
}
