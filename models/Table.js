import Player from "./Player";
import CardDeck from "./CardDeck";

/**
 * Represents a game room; literally a card table.
 */
export default class Table {
  /**
   * @constructor
   * @param {string} tableId - unique string identifier for table.
   * @param {string} ruleset - listed ruleset for the game being played.
   */
  constructor(tableId, ruleset = "ratscrew") {
    this._tableId = tableId;
    this._ruleset = ruleset;
    this._players = [];
    this._cardDeck = new CardDeck();
  }

  /** Adds a Player to this Table, provided their ID is not taken.
   * @param {string} playerId - unique string identifier for Player object to be added.
   */
  addPlayer(playerId) {
    const newPlayer = new Player(playerId);
    if (this._players.find((player) => player.playerId === playerId)) {
      // do nothing; player already exists
    } else {
      this._players.push(newPlayer);
    }
  }

  get players() {
    return this._players;
  }

  get cardDeck() {
    return this._cardDeck;
  }

  set cardDeck(newDeck) {
    this._cardDeck = newDeck;
  }
}
