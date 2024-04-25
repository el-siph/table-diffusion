export enum Suits {
  clover = "clover",
  diamonds = "diamonds",
  hearts = "hearts",
  spades = "spades",
}

/**
 * Represents a single playing card that a Player may possess or discard.
 */
export default class PlayingCard {
  private _pips: number;
  private _suit: Suits;

  /**
   * @constructor
   * @param pips - number of pips, from 1 (Ace) to 13 (King).
   * @param suit - card suit, from the above Suits enum.
   */
  constructor(pips: number, suit: Suits) {
    pips = Math.max(pips, 1);
    pips = Math.min(13, pips);

    this._pips = pips;
    this._suit = suit ?? Suits.clover;
  }

  get pips() {
    return this._pips;
  }

  get suit() {
    return this._suit;
  }

  /**
   * Compares two PlayingCards to determine which has the higher pip count.
   * @param cardA - card to be compared to cardB.
   * @param cardB - card to be compared to cardA.
   * @param isAceFourteen - flags Aces to be 14 pips instead of 1.
   * @returns card with higher pip count; neither if they are equal.
   */
  static getHigherCard(
    cardA: PlayingCard,
    cardB: PlayingCard,
    isAceFourteen: boolean = true,
  ): PlayingCard | null {
    const cardAClone = structuredClone(cardA);
    const cardBClone = structuredClone(cardB);

    isAceFourteen && cardAClone.pips ? (cardAClone._pips = 14) : {};
    isAceFourteen && cardBClone.pips ? (cardBClone._pips = 14) : {};

    return cardAClone.pips > cardBClone.pips
      ? cardA
      : cardAClone.pips < cardBClone.pips
        ? cardB
        : null;
  }
}
