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
    this._players = {};
    this._cardDeck = new CardDeck();
  }

  /** Adds a Player to this Table, provided their ID is not taken.
   * @param {string} playerId - unique string identifier for Player object to be added.
   */
  addPlayerById(playerId) {
    if (this._players[playerId]) {
      // do nothing; player already exists
    } else {
      const newPlayer = new Player(playerId);
      this._players[playerId] = newPlayer;
    }
  }

  /** Returns if a given playerId is found in the Players list.
   * @param playerId
   * @returns {boolean | undefined} Player is found, undefined otherwise.
   */
  hasPlayer(playerId) {
    Object.keys(this._players).map((key) => {
      if (key === playerId) {
        return true;
      }
    });
    return false;
  }

  /** Updates the existing player  */
  updatePlayerById(playerId, updatedPlayer) {
    if (this._players[playerId]) {
      this._players[playerId] = updatedPlayer;
    }
  }

  /** Updates the list of Players.
   * @param {Player[]} players
   */
  setPlayers(players) {
    this._players = structuredClone(players);
  }

  get players() {
    return this._players;
  }

  get cardDeck() {
    return this._cardDeck;
  }

  setCardDeck(newDeck) {
    this._cardDeck = newDeck;
  }

  assignDeckToPlayer(playerId, cards) {
    /** @type {Player} */
    const player = this._players[playerId];
    player.setDeck(new CardDeck(cards));
    this.updatePlayerById(playerId, player);
  }
}
