import CardDeck from "./models/CardDeck";
import Table from "./models/Table";

/** Main Tables Object; Contains collective state of the application. */
let tables;

/** Updates a given Table with a tableId.
 * @param {string} tableId
 * @param {Table} updatedTable
 */
function updateTableById(tableId, updatedTable) {
  const updatedTables = tables;
  updatedTables[tableId] = updatedTable;
  return updatedTable;
}

/** Instantiates a Tables object, usually at server startup. */
export function initializeTables() {
  tables = {};
}

/** Gets the current state of the Tables object.
 * @returns {{} | undefined} tables - state of the application if initialized, otherwise undefined.
 */
export function getTables() {
  return tables;
}

/** Gets the current state of a specific Table, if present.
 * @param {string} tableId
 * @returns {Table | undefined} matching Table, otherwise undefined.
 */
export function getTableById(tableId) {
  return tables[tableId];
}

/**
 * @param {string} tableId - string identifier to join room (if exists)
 * @param {string} playerId - generated string indentifier to join room as player
 * @param {string} playerName - chosen string indentifier
 */
export function joinOrCreateTable(tableId, playerId, playerName) {
  /** @type Table */
  let updatedTable;

  if (!tables[tableId]) {
    tables[tableId] = new Table(tableId);
  }
  updatedTable = tables[tableId];

  if (updatedTable.hasPlayer(playerId)) {
    // emit username taken
  } else {
    updatedTable.addPlayerById(playerId, playerName);
  }

  return updateTableById(tableId, updatedTable);
}

/** Generates a new CardDeck for an existing Table.
 * @param {string} tableId - unique identifier for existing Table.
 */
export function generateDeckForTable(tableId) {
  /** @type Table */
  const table = tables[tableId];

  if (table) {
    table.setCardDeck(CardDeck.generate());
  }

  return updateTableById(tableId, table);
}

/** Shuffles the current CardDeck for an existing Table.
 * @param {string} tableId
 */
export function shuffleDeckForTable(tableId) {
  /** @type Table */
  const table = tables[tableId];
  table.cardDeck.shuffle();

  return updateTableById(tableId, table);
}

/** Divides the specified Table's CardDeck into equal CardDecks for each Player.
 * @param {string} tableId
 */
export function divideDeckForTable(tableId) {
  /** @type Table */
  const table = tables[tableId];
  const dividedDecks = table.cardDeck.divide(table.playerCount);
  Object.keys(table.players).map((key, index) => {
    console.log("dividedDecks", dividedDecks);
    const newDeck = new CardDeck(dividedDecks[index]);
    table._players[key].setDeck(newDeck);
  });
  return updateTableById(tableId, table);
}
