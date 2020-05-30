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
    round: number;
  }
}

type GameEvent = GameEvents.GameStart | GameEvents.GameEnd | GameEvents.Reveal | GameEvents.RoundStart;

export type LogPhase = {
  type: "phase";
  phase: Phase;
};

export type LogEvent = {
  type: "event";
  event: GameEvent;
}

export type LogMove = {
  type: "move";
  player: number;
  move: Move;
}

export type LogItem = LogPhase | LogEvent | LogMove;
