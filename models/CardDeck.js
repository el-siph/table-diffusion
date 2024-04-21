import PlayingCard, { Suits } from "./PlayingCard";

/**
 * Represents a stack of PlayingCards, either for the Table or within each Player's hand.
 */
export default class CardDeck {
  /**
   * @constructor
   * @param {PlayingCard[]} cards - collection of cards to pre-populate this CardDeck, if any.
   */
  constructor(cards = []) {
    this._cards = cards;
  }

  /**
   * Generates and returns a full playing deck of PlayingCards.
   * @param {boolean} hasJokers - flag to include or exclude Joker cards (NOT WORKING).
   * @returns {CardDeck} a pre-populated CardDeck.
   */
  static generateDeck(hasJokers = false) {
    const newDeck = new CardDeck();

    for (let pip = 1; pip < 14; pip++) {
      Object.values(Suits).map((suit) => {
        newDeck.addCard(new PlayingCard(pip, suit));
      });
    }

    if (hasJokers) {
      // TODO: add Joker-type cards.
    }

    return newDeck;
  }

  /**
   * Adds one card to the existing CardDeck.
   * @param {PlayingCard} card - PlayingCard to be added. */
  addCard(card) {
    this._cards.push(card);
  }
}
