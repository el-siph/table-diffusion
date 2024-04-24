import CardDeck from "./models/CardDeck";
import Table from "./models/Table";

/** Main Tables Object; Contains collective state of the application. */
let tables: { [tableId: string]: Table };

/** Updates a given Table with a tableId.
 * @param tableId
 * @param updatedTable
 */
function updateTableById(tableId: string, updatedTable: Table) {
  const updatedTables = tables;
  updatedTables[tableId] = updatedTable;
  return updatedTable;
}

/** Instantiates a Tables object, usually at server startup. */
export function initializeTables() {
  tables = {};
}

/** Gets the current state of the Tables object.
 * @returns {} tables - state of the application if initialized, otherwise undefined.
 */
export function getTables(): {} | undefined {
  return tables;
}

/** Gets the current state of a specific Table, if present.
 * @param tableId
 * @returns matching Table, otherwise undefined.
 */
export function getTableById(tableId: string): Table | undefined {
  return tables[tableId];
}

/**
 * @param tableId - string identifier to join room (if exists)
 * @param playerId - generated string indentifier to join room as player
 * @param playerName - chosen string indentifier
 */
export function joinOrCreateTable(
  tableId: string,
  playerId: string,
  playerName: string,
) {
  let updatedTable: Table;

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
export function generateDeckForTable(tableId: string) {
  const table: Table = tables[tableId];

  if (table) {
    table.setCardDeck(CardDeck.generate());
  }

  return updateTableById(tableId, table);
}

/** Shuffles the current CardDeck for an existing Table.
 * @param tableId
 */
export function shuffleDeckForTable(tableId: string) {
  const table: Table = tables[tableId];
  table.cardDeck.shuffle();

  return updateTableById(tableId, table);
}

/** Divides the specified Table's CardDeck into equal CardDecks for each Player.
 * @param tableId
 */
export function divideDeckForTable(tableId: string) {
  const table: Table = tables[tableId];
  const dividedDecks = table.cardDeck.divide(table.playerCount);
  Object.keys(table.players).map((key, index) => {
    const newDeck = new CardDeck(dividedDecks[index]);
    table.players[key].setDeck(newDeck);
  });
  return updateTableById(tableId, table);
}
