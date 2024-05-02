/**
 * List of Available Interactions with the Table manager
 */
export const enum Actions {
  /* Table CardDeck modifiers */

  /** Generates a central CardDeck for the Table.
   * @requires payload with { tableId }
   * @returns void
   */
  generateTableDeck = "generateTableDeck",

  /** Replaces all PlayingCards back into the central Table's CardDeck.
   * @requires payload with { tableId }
   * @returns void
   */
  resetTableDecks = "resetTableDecks",

  /** Shuffles the CardDeck for the Table (if present).
   * @requires payload with { tableId }
   * @returns void
   */
  shuffleTableDeck = "shuffleTableDeck",

  /** Shuffles the activePile for the Table (if present).
   * @requires payload with { tableId }
   * @returns void
   */
  shuffleTablePile = "shuffleTablePile",

  /** Shuffles the CardDeck for the Player with the playerId in payload.
   * @requires payload with { tableId, playerId, isPassiveDeck? }
   * @returns void
   */
  shufflePlayerDeck = "shufflePlayerDeck",

  /** Shuffles all CardDecks within a given Table with the tableId in payload.
   * @requires payload with { tableId }
   * @returns void
   */
  shuffleAllDecks = "shuffleAllDecks",

  /** Deals an equal division of PlayingCards from the Table CardDeck to each Player at the Table.
   * @requires payload with { tableId }
   @ @returns void
   */
  divideTableDeck = "divideTableDeck",

  /** Records a valid/invalid slap event from a player with the playerId in payload (for Ratscrew).
   * Requires client to determine if slap was valid or invalid.
   * @requires payload with { tableId, playerId, wasValid }
   * @returns void
   */
  slapDeck = "slapDeck",

  /** Dismiss a slap event (for Ratscrew).
   * @requires payload with { tableId }
   * @returns void
   */
  dismissSlap = "dismissSlap",

  /* Deck-to-Deck interactions */

  /** Sends specified amount of PlayingCards from the Table's CardDeck to the specified Player's CardDeck (default = 1).
   * @requires payload with { tableId, playerId, cardCount?, isToPassiveDeck? }
   * @returns void
   */
  popTableToPlayer = "popTableToPlayer",

  /** Sends specified amount of PlayingCards from a specific Players's CardDeck to the Tables's CardDeck (default = 1).
   * @requires payload with { tableId, playerId, cardCount?, isFromPassiveDeck? }
   * @returns void
   */
  popPlayerToTable = "popPlayerToTable",

  /** Sends specific amount of PlayingCards from the Table's CardDeck to the Table's activePile (default = 1).
   * @requires payload with { tableId, cardAmount? }
   */
  popTableToPile = "popTableToPile",

  /** Sends specific amount of PlayingCards from a Player's CardDeck to the Table's activePile (default = 1).
   * @requires payload with { tableId, playerId, cardCount?, isFromPassiveDeck? }
   */
  popPlayerToPile = "popPlayerToPile",

  /** Sends a specific amount of PlayingCards from one Player's CardDeck to another's (default = 1).
   * @requires payload with { tableId, playerIdSending, playerIdReceiving, cardCount?, isFromPassiveDeck?, isToPassiveDeck? }
   */
  popPlayerToPlayer = "popPlayerToPlayer",

  /** Sends specific PlayingCards from the Player's CardDeck to the Table's activePile (default = 1).
   * @requires payload with { tableId, playerId, cardAttributes: { pips, suit } | { pips, suit }[], isFromPassiveDeck? }
   */
  popPlayerToPilePicked = "popPlayerToPilePicked",

  /** Sends specific amount of PlayingCards from a Table's activePile to the Player's CardDeck (default = 1).
   * @requires payload with { tableId, playerId, cardCount?, isFromPassiveDeck? }
   */
  popPileToPlayer = "popPileToPlayer",

  /** Sends specific amount of PlayingCards from a Table's activePile to its deck (default = 1).
   * @requires payload with { tableId, playerId, cardCount? }
   */
  popPileToTable = "popPileToTable",

  /** Swaps the passive and active CardDecks for a chosen Player.
   * @requires payload with { tableId, playerId }
   */
  swapPlayersOwnDecks = "swapPlayersOwnDecks",

  /* Table endpoints */

  /** Either joins or creates a Table.
   * @requires payload with { tableName, playerName }
   * @returns @type{JoinTableResponse} object with generated tableId and playerId values.
   */
  joinTable = "joinTable",

  /** Returns the entire current state of the requested Table.
   * @requires payload with { tableId }
   * @returns Table
   */
  getTableState = "getTableState",

  /** Returns the entire current state of the application.
   * @returns Object of Tables
   */
  getAllTables = "getAllTables",

  // /** UNUSED: Receives one or multiple cards to be put into the Table's CardDeck.
  //  * @requires payload with { tableId, card: { pips, suit } }
  //  * @returns void
  //  */
  // acceptCards = "acceptCards",

  // /** UNUSED: Sends one or multiple cards to the requested Player's CardDeck.
  //  * @requires payload with { tableId, playerId }
  //  * @returns void
  //  */
  // dealCards = "dealCards",
}
