import { expect } from "chai";
import { setup, move as execMove, ended } from './engine';
import { Move } from './move';

describe("Engine", () => {
  it ("should stop after the point limit is reached", () => {
    let G = setup(2, {points: 1, handSize: 4}, "test");

    const moves: Array<{player: number; move: Move}> = [
      {player: 0, move: {name: "chooseCard", data: {number: 34, points: 1}} as Move},
      {player: 1, move: {name: "chooseCard", data: {number: 32, points: 1}} as Move},
      {player: 1, move: {name: "placeCard", data: {row: 3, replace: true}} as Move},
      {player: 0, move: {name: "placeCard", data: {row: 3, replace: false}} as Move},
      {player: 1, move: {name: "chooseCard", data: {number: 37, points: 1}} as Move},
      {player: 0, move: {name: "chooseCard", data: {number: 50, points: 3}} as Move},
      {player: 1, move: {name: "placeCard", data: {row: 3, replace: false}} as Move},
      {player: 0, move: {name: "placeCard", data: {row: 3, replace: false}} as Move},
      {player: 1, move: {name: "chooseCard", data: {number: 80, points: 3}} as Move},
      {player: 0, move: {name: "chooseCard", data: {number: 88, points: 5}} as Move},
      {player: 1, move: {name: "placeCard", data: {row: 2, replace: false}} as Move},
      {player: 0, move: {name: "placeCard", data: {row: 1, replace: false}} as Move},
      {player: 1, move: {name: "chooseCard", data: {number: 89, points: 1}} as Move},
      {player: 0, move: {name: "chooseCard", data: {number: 59, points: 1}} as Move},
      {player: 0, move: {name: "placeCard", data: {row: 3, replace: false}} as Move},
      {player: 1, move: {name: "placeCard", data: {row: 1, replace: false}} as Move}
    ];

    for (const move of moves) {
      G = execMove(G, move.move, move.player);
    }

    expect(G.players[0].points).to.equal(0);
    expect(G.players[1].points).to.equal(1);

    expect(ended(G)).to.be.true;

    G = setup(2, {points: 10, handSize: 4}, "test");

    for (const move of moves) {
      G = execMove(G, move.move, move.player);
    }

    expect(G.players[0].points).to.equal(0);
    expect(G.players[1].points).to.equal(1);

    expect(ended(G)).to.be.false;
  });
});

