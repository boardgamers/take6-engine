import { AvailableMoves } from "./available-moves";
import { LogItem } from "./log";

export interface GameOptions {
  pro?: boolean;
}

export interface Card {
  number: number;
  points: number;
}

export interface Player {
  faceDownCard: Card | null;
  hand: Card[];
  points: number;
  name?: string;
  availableMoves: AvailableMoves | null;
  discard: Card[];
}

export enum Phase {
  ChooseCard = "choose",
  PlaceCard = "place"
}

export interface GameState {
  players: Player[];
  rows: [
    Card[],
    Card[],
    Card[],
    Card[]
  ];
  phase: Phase;
  options: GameOptions;
  log: LogItem[];
  seed: string;
  round: number;
}
