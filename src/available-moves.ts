import { GameState, Phase, Card, Player } from "./gamestate";
import { MoveName } from "./move";

export interface AvailableMoves {
  [MoveName.ChooseCard]?: Card[];
  [MoveName.PlaceCard]?: Array<{row: number; replace: boolean}>;
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

      if (lastCards.every(card => card.number > player.faceDownCard!.number)) {
        return {
          [MoveName.PlaceCard]: [0, 1, 2, 3].map(x => ({row: x, replace: true}))
        };
      }

      const row = lastCards.findIndex(card => card.number === Math.max(...lastCards.filter(card => card.number < player.faceDownCard!.number).map(card => card.number)));

      return {
        [MoveName.PlaceCard]: [{
          row,
          replace: G.rows[row].length >= 5
        }]
      };
    }
  }
}
