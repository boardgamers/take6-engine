import { GameState, Phase, Card, Player } from "./gamestate";

export enum MoveName {
  ChooseCard = "chooseCard",
  PlaceCard = "placeCard"
}

export interface AvailableMoves {
  [MoveName.ChooseCard]?: Card[];
  [MoveName.PlaceCard]?: number[];
}

export function availableMoves(G: GameState, player: Player): AvailableMoves {
  switch (G.phase) {
    case Phase.ChooseCard: {
      return {
        [MoveName.ChooseCard]: player.hand
      };
    }
    case Phase.PlaceCard:
    default: {
      const lastCards = G.rows.map(row => row.slice(-1)[0]);

      if (lastCards.every(card => card.number > player.faceDownCard.number)) {
        return {
          [MoveName.PlaceCard]: [0, 1, 2, 3]
        };
      }
      return {
        [MoveName.PlaceCard]: [
          // Feel free to unwind this line of code :)
          lastCards.findIndex(card => card.number === Math.min(...lastCards.filter(card => card.number < player.faceDownCard.number).map(card => card.number)))
        ]
      };
    }
  }
}
