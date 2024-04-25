import CardDeck from "./models/CardDeck.js";
import Table from "./models/Table.js";

/** Main Tables Object; Contains collective state of the application. */
let tables: { [tableId: string]: Table };

/** Map of created Tables with `tableCodes`, for easy look-up. */
let tableCodesIdsMap: { [tableCode: string]: string };

/** Map of clients (Players) at a given table, for broadcasting. */
let tableClientMap: { [tableId: string]: any[] };

/** Updates a given Table with a tableId.
 * @param tableId
 * @param updatedTable
 */
function updateTableById(tableId: string, updatedTable: Table) {
  const updatedTables = tables;
  updatedTables[tableId] = updatedTable;
  return updatedTable;
}

/** Broadcasts a message to the list of clients in a server */
export function broadcast(
  fastifyServer: any,
  message: string,
  tableId?: string,
) {
  const clients =
    tableId && tableClientMap[tableId]
      ? tableClientMap[tableId]
      : fastifyServer.clients;
  for (const client of clients) {
    client.send(message);
  }
}

/** Adds a client to the tableClientMap, for filtered broadcasts */
export function addClientToMap(tableId: string, client: any) {
  if (!tableClientMap[tableId]) {
    tableClientMap[tableId] = [];
  }

  tableClientMap[tableId].push(client);
}

/** Instantiates a Tables object, usually at server startup. */
export function initializeTables() {
  tables = {};
  tableCodesIdsMap = {};
  tableClientMap = {};
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

/** Either generates a new or references an existing tableId, depending on if a tableCode is recognized. */
export function findOrCreateTableIdByCode(tableCode: string): string {
  const tableId = tableCodesIdsMap[tableCode];

  if (tableId) {
    return tableId;
  } else {
    const newTableId = crypto.randomUUID();
    tableCodesIdsMap[tableCode] = newTableId;
    return newTableId;
  }
}

/**
 * @param tableId - generated string identifier to join room (if exists)
 * @param tableCode - chosen string identifier for Table
 * @param playerId - generated string indentifier to join room as player
 * @param playerName - chosen string indentifier for joining Player
 */
export function joinOrCreateTable(
  tableId: string,
  tableCode: string,
  playerId: string,
  playerName: string,
) {
  let updatedTable: Table;

  if (!tables[tableId]) {
    tables[tableId] = new Table(tableId, tableCode);
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
