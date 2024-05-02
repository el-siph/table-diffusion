import { CardAttribute } from "../interfaces.js";
import PlayingCard, { Suits } from "./PlayingCard.js";

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
        newDeck.pushCards(new PlayingCard(pip, suit as Suits));
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
   * Adds one or more cards to the existing CardDeck.
   * @param cards - PlayingCard(s) to be added. */
  pushCards(cards: PlayingCard | PlayingCard[]) {
    if (Array.isArray(cards)) {
      this._cards = [...this._cards, ...cards];
    } else {
      this._cards.push(cards);
    }
  }

  /** Removes and returns the specified number of cards */
  popCards(cardCount: number): PlayingCard | PlayingCard[] {
    if (!this._cards || this._cards.length < 1 || cardCount < 1) {
      return [];
    }
    if (cardCount === 1) {
      return this._cards.pop()!;
    } else {
      return this._cards.splice(0, cardCount);
    }
  }

  /** Removes and returns the specified PlayingCards.
   * @returns either an empty array, one PlayingCard, or an array of PlayingCards, depending on what matches.
   */
  popCardsByAttribute(
    targetCards: CardAttribute | CardAttribute[],
  ): PlayingCard | PlayingCard[] {
    let poppedCards = [] as PlayingCard[];
    let unpoppedCards = [] as PlayingCard[];

    if (!Array.isArray(targetCards)) {
      targetCards = [targetCards];
    }

    for (const targetCard of targetCards) {
      for (let i = 0; i < this._cards.length; i++) {
        const checkedCard = this._cards[i];
        if (
          checkedCard.pips === targetCard.pips &&
          checkedCard.suit === targetCard.suit
        ) {
          poppedCards.push(checkedCard);
        } else {
          unpoppedCards.push(checkedCard);
        }
      }
    }

    this._cards = [...unpoppedCards];

    return poppedCards.length < 1
      ? []
      : poppedCards.length < 2
        ? poppedCards[0]
        : [...poppedCards];
  }

  /** Removes requested PlayingCard from the existing CardDeck.
   * @param cards - PlayingCard to be removed.
   */
  removeCards(cards: PlayingCard | PlayingCard[]) {
    let cardsToFilter: PlayingCard[];
    if (!Array.isArray(cards)) {
      cardsToFilter = [cards];
    } else {
      cardsToFilter = cards;
    }

    cardsToFilter.map((card) => {
      this._cards = this._cards.filter(
        (c) => c.pips !== card.pips && c.suit !== card.suit,
      );
    });
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

  reset() {
    this._cards = [];
  }

  get length() {
    return this._cards.length;
  }
}
