import { Phase, Card } from "./gamestate";
import { Move } from "./move";

export enum GameEventName {
  GameStart = "start",
  GameEnd = "end",
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
}

type GameEvent = GameEvents.GameStart | GameEvents.GameEnd | GameEvents.Reveal;

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
