import { Phase, Card } from "./gamestate";
import { Move } from "./move";

enum GameEventName {
  GameStart = "start",
  GameEnd = "end",
  RevealCards = "reveal",
  TakeRow = "take",
}

export namespace GameEvents {
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

  export interface TakeRow {
    name: GameEventName.TakeRow;
    cards: Card[];
    player: number;
  }
}

type GameEvent = GameEvents.GameStart | GameEvents.GameEnd | GameEvents.Reveal | GameEvents.TakeRow;

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
