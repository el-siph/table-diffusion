import CardDeck from "./CardDeck.js";
import Player from "./Player.js";
import type PlayingCard from "./PlayingCard.js";

interface PlayersTable {
  [playerId: string]: Player;
}

interface SlapEvent {
  playerId: string | null;
  wasJustSlapped: boolean;
  wasValid: boolean;
}

/**
 * Represents a game room; literally a card table.
 */
export default class Table {
  private _tableId: string;
  private _tableCode: string;
  private _ruleset: string;
  private _players: PlayersTable;
  private _cardDeck: CardDeck;
  private _activePile: CardDeck;
  private _playerCount: number;
  private _slapEvent: SlapEvent;

  /**
   * @constructor
   * @param tableId - unique string identifier for table.
   * @param tableCode - four-letter identifier for finding this table.
   * @param ruleset - listed ruleset for the game being played.
   */
  constructor(
    tableId: string,
    tableCode: string,
    ruleset: string = "ratscrew",
  ) {
    this._tableId = tableId;
    this._tableCode = tableCode;
    this._ruleset = ruleset;
    this._players = {};
    this._cardDeck = new CardDeck();
    this._activePile = new CardDeck();
    this._playerCount = 0;
    this._slapEvent = {
      wasJustSlapped: false,
      wasValid: false,
      playerId: null,
    };
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
      this._playerCount++;
    }
  }

  /** Removes a Player from this Table, provided their ID is found. */
  removePlayerById(playerId: string) {
    const newPlayers: PlayersTable = {};
    Object.keys(this._players).map((key) => {
      if (key !== playerId) {
        newPlayers[key] = this._players[key];
      }
    });

    this._players = newPlayers;
    this._playerCount--;
  }

  /** Returns a playerId if a playerName is found in the Players list.
   * @param playerName
   * @returns Player is found, undefined otherwise.
   */
  findPlayerIdByName(playerName: string): string | null {
    console.log("searching for", playerName);
    let retval = null;
    Object.keys(this._players).map((key) => {
      console.log("evaluating player", key);
      const player = this._players[key];
      if (player.playerName === playerName) {
        console.log("playerFound for", playerName);
        retval = player.playerId;
      }
    });
    return retval;
  }

  /** Updates the existing player  */
  updatePlayerById(playerId: string, updatedPlayer: Player) {
    if (this._players[playerId]) {
      this._players[playerId] = updatedPlayer;
    }
  }

  resetAllDecks() {
    Object.keys(this._players).map((playerId) => {
      const player = this._players[playerId];
      player.activeDeck.reset();
      player.passiveDeck.reset();
    });

    this._activePile.reset();
    this._cardDeck = CardDeck.generate();
  }

  recordSlap(wasValid: boolean, playerId: string) {
    this._slapEvent = {
      wasJustSlapped: true,
      wasValid,
      playerId,
    };
  }

  dismissSlap() {
    this._slapEvent = {
      wasJustSlapped: false,
      wasValid: false,
      playerId: null,
    };
  }

  get tableId() {
    return this._tableId;
  }

  get tableCode() {
    return this._tableCode;
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

  get activePile() {
    return this._activePile;
  }

  setCardDeck(newDeck: CardDeck) {
    this._cardDeck = newDeck;
  }

  setActivePile(newDeck: CardDeck) {
    this._activePile = newDeck;
  }

  addCardsToActivePile(cards: PlayingCard | PlayingCard[]) {
    if (Array.isArray(cards)) {
    } else {
      this._activePile.pushCards(cards);
    }
  }

  get playerCount() {
    return this._playerCount;
  }

  assignDeckToPlayer(playerId: string, cards: PlayingCard[]) {
    const player = this._players[playerId];
    player.setActiveDeck(new CardDeck(cards));
    this.updatePlayerById(playerId, player);
  }
}
