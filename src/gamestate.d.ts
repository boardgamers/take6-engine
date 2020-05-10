import { AvailableMoves } from "./available-moves";
import { LogItem } from "./log";

export interface GameOptions {
  pro: boolean;
}

export interface Card {
  number: number;
  points: number;
}

export interface Player {
  faceDownCard: Card;
  hand: Card[];
  points: number;
  name?: string;
  availableMoves?: AvailableMoves;
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
}
