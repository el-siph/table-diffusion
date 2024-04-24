import CardDeck from "./CardDeck";
import Player from "./Player";
import type PlayingCard from "./PlayingCard";

interface PlayersTable {
  [playerId: string]: Player;
}

/**
 * Represents a game room; literally a card table.
 */
export default class Table {
  private _tableId: string;
  private _ruleset: string;
  private _players: PlayersTable;
  private _cardDeck: CardDeck;

  /**
   * @constructor
   * @param tableId - unique string identifier for table.
   * @param ruleset - listed ruleset for the game being played.
   */
  constructor(tableId: string, ruleset: string = "ratscrew") {
    this._tableId = tableId;
    this._ruleset = ruleset;
    this._players = {};
    this._cardDeck = new CardDeck();
  }

  /** Adds a Player to this Table, provided their ID is not taken.
   * @param playerId - unique string identifier for Player object to be added.
   * @param playerName - chosen string indentifier to join room as player
   */
  addPlayerById(playerId: string, playerName: string) {
    if (this._players[playerId]) {
      // do nothing; player already exists
    } else {
      const newPlayer = new Player(playerId, playerName);
      this._players[playerId] = newPlayer;
    }
  }

  /** Returns if a given playerId is found in the Players list.
   * @param playerId
   * @returns Player is found, undefined otherwise.
   */
  hasPlayer(playerId: string): boolean {
    Object.keys(this._players).map((key) => {
      if (key === playerId) {
        return true;
      }
    });
    return false;
  }

  /** Updates the existing player  */
  updatePlayerById(playerId: string, updatedPlayer: Player) {
    if (this._players[playerId]) {
      this._players[playerId] = updatedPlayer;
    }
  }

  get tableId() {
    return this._tableId;
  }

  get ruleset() {
    return this._ruleset;
  }

  /** Updates the list of Players.
   * @param players
   */
  setPlayers(players: { [playerId: string]: Player }) {
    this._players = players;
  }

  get players() {
    return this._players;
  }

  get cardDeck() {
    return this._cardDeck;
  }

  setCardDeck(newDeck: CardDeck) {
    this._cardDeck = newDeck;
  }

  get playerCount() {
    return Object.keys(this._players).length;
  }

  assignDeckToPlayer(playerId: string, cards: PlayingCard[]) {
    const player = this._players[playerId];
    player.setDeck(new CardDeck(cards));
    this.updatePlayerById(playerId, player);
  }
}
