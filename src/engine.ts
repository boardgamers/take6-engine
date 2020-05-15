import assert from "assert";
import seedrandom from "seedrandom";
import shuffleSeed from "shuffle-seed";
import { GameOptions, Phase, GameState, Card } from "./gamestate";
import { getCard } from "./card";
import { availableMoves } from "./available-moves";
import { isEqual, sumBy } from "lodash";
import { Move, Moves, MoveName } from "./move";
import { asserts } from "./utils";

export function setup(numPlayers: number, options: GameOptions, seed: string): GameState {
  const rng = seedrandom(seed || Math.random().toString());

  const cards = shuffleSeed.shuffle(new Array(104).fill(0).map((x, i) => getCard(i + 1)), rng());

  const rows = new Array(4).fill(0).map(() => [cards.shift()]);

  const players = new Array(numPlayers).fill(0).map(() => ({
    hand: cards.splice(0, 10),
    points: 0,
    discard: []
  }));

  const G: GameState = {
    players,
    rows,
    options,
    phase: Phase.ChooseCard
  } as GameState;

  for (const player of G.players) {
    player.availableMoves = availableMoves(G, player);
  }

  return G;
}

export function stripSecret(G: GameState, player: number): GameState {
  return {
    ...G,
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
  assert(available.some((x: Card | number) => isEqual(x, move.data)), "Wrong argument for the command " + move.name);

  switch (move.name) {
    case MoveName.ChooseCard: {
      // Should not be needed, typescript should make the distinction itself
      asserts<Moves.MoveChooseCard>(move);
      player.faceDownCard = move.data;
      player.hand.splice(player.hand.findIndex(c => isEqual(c, move.data)), 1);
      delete player.availableMoves;

      if (G.players.every(pl => pl.faceDownCard)) {
        G.phase = Phase.PlaceCard;

        G = switchToNextPlayer(G);
      }

      return G;
    }
    case MoveName.PlaceCard: {
      delete player.availableMoves;

      if (player.faceDownCard.number < G.rows[move.data].slice(-1)[0].number || G.rows[move.data].length === 6) {
        player.discard.push(...G.rows[move.data]);
        G.rows[move.data] = [player.faceDownCard];
      } else {
        G.rows[move.data].push(player.faceDownCard);
      }

      delete player.faceDownCard;
      return G;
    }
  }
}

function switchToNextPlayer(G: GameState): GameState {
  if (ended(G)) {
    return G;
  }

  if (G.players.every(pl => !pl.faceDownCard)) {
    G.phase = Phase.ChooseCard;

    for (const player of G.players) {
      player.availableMoves = availableMoves(G, player);
    }

    return G;
  }

  const player = G.players.find(pl => pl.faceDownCard.number === Math.min(...G.players.filter(pl => pl.faceDownCard).map(pl => pl.faceDownCard.number)));

  player.availableMoves = availableMoves(G, player);

  return G;
}

function ended(G: GameState): boolean {
  return G.players.every(pl => !pl.faceDownCard && pl.hand.length === 0);
}

export function scores(G: GameState): number[] {
  return G.players.map(pl => sumBy(pl.discard, "points"));
}
