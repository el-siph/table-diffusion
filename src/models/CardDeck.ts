import PlayingCard, { Suits } from "./PlayingCard";

/**
 * Represents a stack of PlayingCards, either for the Table or within each Player's hand.
 */
export default class CardDeck {
  private _cards: PlayingCard[];

  /**
   * @constructor
   * @param cards - collection of cards to pre-populate this CardDeck, if any.
   */
  constructor(cards = [] as PlayingCard[]) {
    this._cards = cards;
  }

  /**
   * Generates and returns a full playing deck of PlayingCards.
   * @param hasJokers - flag to include or exclude Joker cards (NOT WORKING).
   * @returns a pre-populated CardDeck.
   */
  static generate(hasJokers: boolean = false): CardDeck {
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
   * @param playerCount - number of divisions to be made
   * @returns array with PlayingCard, separated by player index.
   */
  divide(playerCount: number): PlayingCard[][] {
    const dividedCards = [];
    const divisionSize = this._cards.length / playerCount;

    if (this._cards.length > 0) {
      for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
        dividedCards[playerIndex] = [] as PlayingCard[];
        for (let cardIndex = 0; cardIndex < divisionSize; cardIndex++) {
          const card = this._cards.shift();
          if (card) {
            dividedCards[playerIndex].push(card);
          }
        }
      }
    }

    this._cards = []; // clear out remaining cards

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
   * @param card - PlayingCard to be added. */
  addCard(card: PlayingCard) {
    this._cards.push(card);
  }

  /** Removes requested PlayingCard from the existing CardDeck.
   * @param card - PlayingCard to be removed.
   */
  removeCard(card: PlayingCard) {
    this._cards = this._cards.filter(
      (c) => c.pips !== card.pips && c.suit !== card.suit,
    );
  }

  /**
   * Finds a card with the specified pips and suit.
   * @param pips
   * @param suit
   * @returns matching card (if found).
   */
  findCard(pips: number, suit: Suits): PlayingCard | undefined {
    return this._cards.find((card) => card.pips === pips && card.suit === suit);
  }
}
