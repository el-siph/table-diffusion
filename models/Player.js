/** Represents a player at a Table. */
export default class Player {
  /**
   * @constructor
   * @param {string} playerId - unique string identifier for player.
   */
  constructor(playerId) {
    this._playerId = playerId;
    this._deck = [];
  }

  get playerId() {
    return this._playerId;
  }

  get deck() {
    return this._deck;
  }

  set deck(newDeck) {
    this._deck = newDeck;
  }
}
