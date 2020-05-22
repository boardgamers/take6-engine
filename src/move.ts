import { Card } from "./gamestate";

export declare namespace Moves {
  export interface MoveChooseCard {
    name: MoveName.ChooseCard;
    data: Card;
  }

  export interface MovePlaceCard {
    name: MoveName.PlaceCard;
    data: number;
  }
}

export type Move = Moves.MoveChooseCard | Moves.MovePlaceCard;

export enum MoveName {
  ChooseCard = "chooseCard",
  PlaceCard = "placeCard"
}
