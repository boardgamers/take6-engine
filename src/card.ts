import { Card } from "./gamestate";

/**
 * Get the full card info based on its number
 * @param number
 */
export function getCard(number: number): Card {
  let points = 1;

  if (number === 55) {
    points = 7;
  } else if (number % 11 === 0) {
    points = 5;
  } else if (number % 10 === 0) {
    points = 3;
  } else if (number % 5 === 0) {
    points = 2;
  }

  return  {
    number,
    points
  };
}