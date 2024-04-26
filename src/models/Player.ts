import CardDeck from "./CardDeck.js";

/** Represents a player at a Table. */
export default class Player {
  private _playerId: string;
  private _playerName: string;
  private _cardDeck: CardDeck;

  /**
   * @constructor
   * @param playerId - unique string identifier for Player
   * @param playerName - chosen string idenfier for Player
   */
  constructor(playerId: string, playerName: string) {
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
   * @param newPlayerName
   */
  set playerName(newPlayerName: string) {
    this._playerName = newPlayerName;
  }

  get cardDeck() {
    return this._cardDeck;
  }

  /** Assigns new CardDeck to this Player.
   * @param newDeck
   */
  setDeck(newDeck: CardDeck) {
    this._cardDeck = newDeck;
  }
}
