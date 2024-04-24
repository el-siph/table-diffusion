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
  static generate(hasJokers = false) {
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

  /** Divides the current PlayingCards into partitions for each Player. Automatically removes remainder.
   * @param {number} playerCount - number of divisions to be made
   * @returns {object} dividedCards - object with PlayingCard arrays, with index keys.
   */
  divide(playerCount) {
    const dividedCards = {};
    const divisionSize = this._cards.length / playerCount;

    if (this._cards.length) {
      for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
        dividedCards[playerIndex] = [];
        for (
          let cardIndex = divisionSize * playerIndex;
          cardIndex < cardIndex + divisionSize;
          cardIndex++
        ) {
          const card = this._cards[cardIndex * playerIndex - 1];
          dividedCards[playerIndex].push(card);
        }
      }
    }

    return dividedCards;
  }

  /** Shuffles the current CardDeck using Durstenfeld algorithm. */
  shuffle() {
    for (let i = this._cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this._cards[i], this._cards[j]] = [this._cards[j], this._cards[i]];
    }
  }

  /**
   * Adds one card to the existing CardDeck.
   * @param {PlayingCard} card - PlayingCard to be added. */
  addCard(card) {
    this._cards.push(card);
  }

  /** Removes requested PlayingCard from the existing CardDeck.
   * @param {PlayingCard} card - PlayingCard to be removed.
   */
  removeCard(card) {
    this._cards = this._cards.filter(
      (c) => c.pips !== card.pips && c.suit !== card.suit,
    );
  }

  /**
   * Finds a card with the specified pips and suit.
   * @param {number} pips
   * @param {Suits} suit
   * @returns {PlayingCard} matching card (if found).
   */
  findCard(pips, suit) {
    return this._cards.find((card) => card.pips === pips && card.suit === suit);
  }
}
