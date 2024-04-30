import { BroadcastMessage, CardAttribute } from "./interfaces.js";
import CardDeck from "./models/CardDeck.js";
import Player from "./models/Player.js";
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

/** Finds the associated Table and Player(s) for various CardDeck interactions.
 * @returns an object with all found entries, null otherwise.
 */
function getTableAndPlayersByIds(
  tableId: string,
  playerId: string,
  playerIdReceiving?: string,
): {
  table: Table | undefined;
  player: Player | undefined;
  playerReceiving?: Player | undefined;
} {
  const table: Table = tables[tableId];
  const player = table.players[playerId];

  if (playerIdReceiving) {
    const playerReceiving = table.players[playerIdReceiving];

    return {
      table,
      player,
      playerReceiving,
    };
  }

  return {
    table,
    player,
  };
}

/** Broadcasts a message to the list of clients in a server */
export function broadcast(
  fastifyServer: any,
  message: BroadcastMessage,
  tableId?: string,
) {
  const clients =
    tableId && tableClientMap[tableId]
      ? tableClientMap[tableId]
      : fastifyServer.clients;
  for (const client of clients) {
    client.send(JSON.stringify(message));
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

/** Returns either a generated playerId or an existing one associated with the provided playerName. */
export function findOrCreatePlayerIdByName(
  tableId: string,
  playerName: string,
): { playerId: string; wasFound: boolean } {
  const table = tables[tableId];

  if (table) {
    let playerId = table.findPlayerIdByName(playerName);
    return playerId
      ? { playerId, wasFound: true }
      : {
          playerId: crypto.randomUUID(),
          wasFound: false,
        };
  }

  return { playerId: crypto.randomUUID(), wasFound: false };
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

  if (updatedTable.findPlayerIdByName(playerName) === null) {
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
    return updateTableById(tableId, table);
  }
}

/** Shuffles the current CardDeck for an existing Table.
 * @param tableId
 */
export function shuffleDeckForTable(tableId: string) {
  const table: Table = tables[tableId];
  if (table) {
    table.cardDeck.shuffle();

    return updateTableById(tableId, table);
  }
}

/** Divides the specified Table's CardDeck into equal CardDecks for each Player.
 * @param tableId
 */
export function divideDeckForTable(tableId: string) {
  const table: Table = tables[tableId];

  if (table) {
    const dividedDecks = table.cardDeck.divide(table.playerCount);
    Object.keys(table.players).map((key, index) => {
      const newDeck = new CardDeck(dividedDecks[index]);
      table.players[key].setActiveDeck(newDeck);
    });
    return updateTableById(tableId, table);
  }
}

/** Moves a select number of PlayingCards from a specified Player's CardDeck to the Table's activePile. */
export function popPlayerToPile(
  tableId: string,
  playerId: string,
  cardCount = 1,
) {
  const { table, player } = getTableAndPlayersByIds(tableId, playerId);

  if (table && player) {
    const poppedCards = player.activeDeck.popCards(cardCount);
    table.activePile.pushCards(poppedCards);
    return updateTableById(tableId, table);
  }
}

/** Moves a selection of PlayingCards from a specific Player's CardDeck to the Table's activePile. */
export function popPlayerToPilePicked(
  tableId: string,
  playerId: string,
  cardsAttributes: CardAttribute | CardAttribute[],
) {
  const { table, player } = getTableAndPlayersByIds(tableId, playerId);

  if (table && player) {
    const poppedCards = player.activeDeck.popCardsByAttribute(cardsAttributes);
    table.activePile.pushCards(poppedCards);
    return updateTableById(tableId, table);
  }
}

/** Moves a select number of PlayingCards from one Player's CardDeck to another. */
export function popPlayerToPlayer(
  tableId: string,
  playerIdSending: string,
  playerIdReceiving: string,
  cardCount = 1,
) {
  const {
    table,
    player: playerSending,
    playerReceiving,
  } = getTableAndPlayersByIds(tableId, playerIdSending, playerIdReceiving);

  if (table && playerSending && playerReceiving) {
    const poppedCards = playerSending.activeDeck.popCards(cardCount);
    playerReceiving.activeDeck.pushCards(poppedCards);
    return updateTableById(tableId, table);
  }
}

/** Moves a select number of PlayingCards from the Table's CardDeck to a specific Player's CardDeck */
export function popTableToPlayer(
  tableId: string,
  playerId: string,
  cardCount = 1,
) {
  const { table, player } = getTableAndPlayersByIds(tableId, playerId);

  if (table && player) {
    const poppedCards = table.cardDeck.popCards(cardCount);
    player.activeDeck.pushCards(poppedCards);
    return updateTableById(tableId, table);
  }
}

/** Moves a select number of PlayingCards from a Player's CardDeck to their Table's CardDeck. */
export function popPlayerToTable(
  tableId: string,
  playerId: string,
  cardCount = 1,
) {
  const { table, player } = getTableAndPlayersByIds(tableId, playerId);

  if (table && player) {
    const poppedCards = player.activeDeck.popCards(cardCount);
    table.cardDeck.pushCards(poppedCards);
    return updateTableById(tableId, table);
  }
}

/** Moves a select number of PlayingCards from a Table's CardDeck to its activePile. */
export function popTableToPile(tableId: string, cardCount = 1) {
  const table = getTableById(tableId);

  if (table) {
    const poppedCards = table.cardDeck.popCards(cardCount);
    table.activePile.pushCards(poppedCards);
    return updateTableById(tableId, table);
  }
}

/** Shuffles a selected Player's CardDeck. */
export function shufflePlayerDeck(tableId: string, playerId: string) {
  const { table, player } = getTableAndPlayersByIds(tableId, playerId);

  if (table && player) {
    player.activeDeck.shuffle();
    return updateTableById(tableId, table);
  }
}

/** Restores a Table's CardDeck and reset the activePile and all other CardDecks */
export function resetAllDecks(tableId: string) {
  const table = getTableById(tableId);

  if (table) {
    table.resetAllDecks();
    return updateTableById(tableId, table);
  }
}

/** Records a slap event, either valid or invalid. */
export function slapDeck(tableId: string, playerId: string, wasValid: boolean) {
  const table = getTableById(tableId);

  if (table) {
    table.recordSlap(wasValid, playerId);
  }
}

/** Dismisses an active slap event, restoring the state of the Table. */
export function dismissSlap(tableId: string) {
  const table = getTableById(tableId);

  if (table) {
    table.dismissSlap();
  }
}
