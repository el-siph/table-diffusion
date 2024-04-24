import CardDeck from "./CardDeck";

/** Represents a player at a Table. */
export default class Player {
  /**
   * @constructor
   * @param {string} playerId - unique string identifier for player.
   */
  constructor(playerId) {
    this._playerId = playerId;
    this._cardDeck = new CardDeck();
  }

  get playerId() {
    return this._playerId;
  }

  get deck() {
    return this._cardDeck;
  }

  /** Assigns new CardDeck to this Player.
   * @param {CardDeck} newDeck
   */
  setDeck(newDeck) {
    this._cardDeck = newDeck;
  }
}
