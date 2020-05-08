import {Game, Ctx} from "boardgame.io";

/**
 * Get the full card info based on its number
 * @param number
 */
function getCard(number: number): Card {
  return  {
    number,
    points: 1
  };
}

interface Card {
  number: number;
  points: number;
}

interface Player {
  cards: Card[];
  points: number;
}

export interface GameState {
  players: Player[];
  rows: [
    Card[],
    Card[],
    Card[],
    Card[]
  ]
}

const Engine: Game<GameState> = {
  setup: (ctx): GameState => {
    const cards = ctx.random.Shuffle(new Array(104).fill(0).map((x, i) => getCard(i + 1)));
    const rows = new Array(4).fill(0).map(() => [cards.shift()]);
    const players = new Array(10).fill(0).map(() => ({
      cards: cards.splice(0, 10),
      points: 0
    }));

    return {
      players,
      rows
    } as GameState;
  },
  moves: {
    pickCard(state: GameState, ctx: Ctx, card: Card) {

    },
    placeOnBoard(state: GameState, ctx: Ctx, rowIndex: number) {

    }
  }
};

export {Engine};
