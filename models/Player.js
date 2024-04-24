import CardDeck from "./CardDeck";

/** Represents a player at a Table. */
export default class Player {
  /**
   * @constructor
   * @param {string} playerId - unique string identifier for Player
   * @param {string} playerName - chosen string idenfier for Player
   */
  constructor(playerId, playerName) {
    this._playerId = playerId;
    this._playerName = playerName;
    this._cardDeck = new CardDeck();
  }

  get playerId() {
    return this._playerId;
  }

  get playerName() {
    return this._playerName;
  }

  /** Updates the current Player's playerName
   * @param {string} newPlayerName
   */
  set playerName(newPlayerName) {
    this._playerName = newPlayerName;
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
