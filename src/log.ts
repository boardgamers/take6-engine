import { Phase, Card } from "./gamestate";
import { Move } from "./move";

export enum GameEventName {
  GameStart = "start",
  GameEnd = "end",
  RoundStart = "round",
  RevealCards = "reveal",
}

export declare namespace GameEvents {
  export interface GameStart {
    name: GameEventName.GameStart;
  }

  export interface GameEnd {
    name: GameEventName.GameEnd;
  }

  export interface Reveal {
    name: GameEventName.RevealCards;
    cards: Card[];
  }

  export interface RoundStart {
    name: GameEventName.RoundStart;
    cards: {
      board: Card[];
      players: Card[][];
    };
  }
}

type GameEvent = GameEvents.GameStart | GameEvents.GameEnd | GameEvents.Reveal | GameEvents.RoundStart;

export type LogItem = {
  type: "phase";
  phase: Phase;
} | {
  type: "event";
  event: GameEvent;
} | {
  type: "move";
  player: number;
  move: Move;
};
