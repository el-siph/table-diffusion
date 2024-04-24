/**
 * List of Available Interactions with the Table manager
 */
export const actions = {
  /** Generates a central CardDeck for the Table.
   * @requires payload with { tableId }
   * @returns void
   */
  generateTableDeck: "generateTableDeck",

  /** Shuffles the CardDeck for the Table (if present).
   * @requires payload with { tableId }
   * @returns void
   */
  shuffleTableDeck: "shuffleTableDeck",

  /** Shuffles the CardDeck for the Player with the playerId in payload.
   * @requires payload with { tableId, playerId }
   * @returns void
   */
  shufflePlayerDeck: "shufflePlayerDeck",

  /** Shuffles all CardDecks within a given Table with the tableId in payload.
   * @requires payload with { tableId }
   * @returns void
   */
  shuffleAllDecks: "shuffleAllDecks",

  /** Deals an equal division of PlayingCards from the Table CardDeck to each Player at the Table.
   * @requires payload with { tableId }
   @ @returns void
   */
  divideTableDeck: "divideTableDeck",

  /** Sends specified amount of PlayingCards from the Table CardDeck to the specified Player's CardDeck (default = 1).
   * @requires payload with { tableId, playerId, cardAmount? }
   * @returns void
   */
  popToPlayer: "popToPlayer",

  /** Sends specified amount of PlayingCards from the Table's CardDeck to the specified Player's CardDeck (default = 1).
   * @requires payload with { tableId, playerId, cardAmount? }
   * @returns void
   */
  popToTable: "popToTable",

  // /** UNUSED: Receives one or multiple cards to be put into the Table's CardDeck.
  //  * @requires payload with { tableId, card: { pips, suit } }
  //  * @returns void
  //  */
  acceptCards: "acceptCards",

  // /** UNUSED: Sends one or multiple cards to the requested Player's CardDeck.
  //  * @requires payload with { tableId, playerId }
  //  * @returns void
  //  */
  dealCards: "dealCards",

  /** Either joins or creates a Table.
   * @requires payload with { tableId, playerId }
   * @returns void
   */
  joinTable: "joinTable",

  /** Returns the entire current state of the requested Table.
   * @requires payload with { tableId }
   * @returns Table
   */
  getTableState: "getTableState",

  /** Returns the entire current state of the application.
   * @returns Object of Tables
   */
  getAllTables: "getAllTables",

  /** Records a valid/invalid slap event from a player with the playerId in payload (for Ratscrew).
   * @requires payload with { tableId, playerId, isSlapValid }
   * @returns void
   */
  slapDeck: "slapDeck",
};
