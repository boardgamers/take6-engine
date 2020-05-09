import { Card } from "./gamestate";

/**
 * Get the full card info based on its number
 * @param number
 */
export function getCard(number: number): Card {
  return  {
    number,
    points: 1
  };
}