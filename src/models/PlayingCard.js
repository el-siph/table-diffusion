export const Suits = {
  clover: "clover",
  diamonds: "diamonds",
  hearts: "hearts",
  spades: "spades",
};

/**
 * Represents a single playing card that a Player may possess or discard.
 */
export default class PlayingCard {
  /**
   * @constructor
   * @param {number} pips - number of pips, from 1 (Ace) to 13 (King).
   * @param {Suits} suit - card suit, from the above Suits enum.
   */
  constructor(pips, suit) {
    if (Suits[suit]) {
      pips = Math.max(pips, 1);
      pips = Math.min(13, pips);

      this._pips = pips;
      this._suit = Suits[suit];
    }
  }

  get pips() {
    return this._pips;
  }

  get suit() {
    return this._suit;
  }

  /**
   * Compares two PlayingCards to determine which has the higher pip count.
   * @param {PlayingCard} cardA - card to be compared to cardB.
   * @param {PlayingCard} cardB - card to be compared to cardA.
   * @param {boolean} isAceFourteen - flags Aces to be 14 pips instead of 1.
   * @returns {PlayingCard} card with higher pip count; neither if they are equal.
   */
  static getHigherCard(cardA, cardB, isAceFourteen = true) {
    const cardAClone = structuredClone(cardA);
    const cardBClone = structuredClone(cardB);

    isAceFourteen && cardAClone.pips ? (cardAClone._pips = 14) : {};
    isAceFourteen && cardBClone.pips ? (cardBClone._pips = 14) : {};

    cardAClone.pips > cardBClone.pips
      ? cardA
      : cardAClone.pips < cardBClone.pips
        ? cardB
        : null;
  }
}
