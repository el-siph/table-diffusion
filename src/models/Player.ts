import CardDeck from "./CardDeck.js";

/** Represents a player at a Table. */
export default class Player {
  private _playerId: string;
  private _playerName: string;
  private _activeDeck: CardDeck; // also used as the Player's "hand"
  private _passiveDeck: CardDeck; // deck not currently in play; becomes the new _activeDeck after the original is exhausted

  /**
   * @constructor
   * @param playerId - unique string identifier for Player
   * @param playerName - chosen string idenfier for Player
   */
  constructor(playerId: string, playerName: string) {
    this._playerId = playerId;
    this._playerName = playerName;
    this._activeDeck = new CardDeck();
    this._passiveDeck = new CardDeck();
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

  get activeDeck() {
    return this._activeDeck;
  }

  get passiveDeck() {
    return this._passiveDeck;
  }

  /** Assigns new active CardDeck to this Player.
   * @param newDeck
   */
  setActiveDeck(newDeck: CardDeck) {
    this._activeDeck = newDeck;
  }

  setPassiveDeck(newDeck: CardDeck) {
    this._passiveDeck = newDeck;
  }
}
