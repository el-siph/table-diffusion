import Fastify from "fastify";
import Table from "./models/Table";
import CardDeck from "./models/CardDeck";
import fastifyWS from "@fastify/websocket";
import { actions } from "./src/actions";

const PORT = parseInt(process.env.PORT) ?? 8080;

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyWS);

/** Contains collective state of the application. */
let tables;

/* Sockets */
fastify.register(async function (fastify) {
  fastify.get("/dealer", { websocket: true }, (socket, request) => {
    socket.on("message", (message) => {
      const { action, payload } = JSON.parse(message.toString());
      console.log("action", action);

      switch (action) {
        case actions.joinTable:
          joinOrCreateTable(payload.tableId, payload.playerId);
          socket.send(`joined table '${payload.tableId}'`);
          break;

        case actions.generateTableDeck:
          generateDeckForTable(payload.tableId);

          if (payload.isShuffled) {
            shuffleDeckForTable(payload.tableId);
          }

          socket.send(
            `generated ${payload.isShuffled ? "shuffled " : ""}deck for ${payload.tableId}`,
          );
          break;

        case actions.shuffleTableDeck:
          shuffleDeckForTable(payload.tableId);
          socket.send(`shuffled deck for ${payload.tableId}`);
          break;

        case actions.divideTableDeck:
          divideDeckForTable(payload.tableId);
          socket.send(`divided deck for ${payload.tableId}`);
          break;

        case actions.getTableState:
          /** @type Table */
          const table = tables[payload.tableId];
          socket.send(JSON.stringify(table));
          break;

        case actions.getAllTables:
          socket.send(JSON.stringify(tables));
          break;
      }
    });

    socket.send("Connected to dealer...");

    socket.on("error", console.error);

    socket.on("close", () => {
      socket.send("Disconnected from websocket.");
    });
  });
});

/* Functions */

/** Updates a given Table with a tableId
 * @param {string} tableId
 * @param {Table} updatedTable
 */
function updateTableById(tableId, updatedTable) {
  const updatedTables = tables;
  updatedTables[tableId] = updatedTable;
  tables = updatedTables;
}

/**
 * @param {string} tableId - string identifier to join room (if exists)
 * @param {string} playerId - string indentifier to join room as player
 */
function joinOrCreateTable(tableId, playerId) {
  /** @type Table */
  let updatedTable;

  if (!tables[tableId]) {
    tables[tableId] = new Table(tableId);
  }
  updatedTable = tables[tableId];

  if (updatedTable.hasPlayer(playerId)) {
    // emit username taken
  } else {
    updatedTable.addPlayerById(playerId);
  }

  updateTableById(tableId, updatedTable);
}

/** Generates a new CardDeck for an existing Table.
 * @param {string} tableId - unique identifier for existing Table.
 */
function generateDeckForTable(tableId) {
  /** @type Table */
  const table = tables[tableId];

  if (table) {
    table.setCardDeck(CardDeck.generate());
  }

  updateTableById(tableId, table);
}

/** Shuffles the current CardDeck for an existing Table.
 * @param {string} tableId
 */
function shuffleDeckForTable(tableId) {
  /** @type Table */
  const table = tables[tableId];
  table.cardDeck.shuffle();

  updateTableById(tableId, table);
}

function divideDeckForTable(tableId) {
  /** @type Table */
  const table = tables[tableId];
  const playerDecks = table.cardDeck.divide(table.players.length);
  table.players.map((player, index) => {
    player.setDeck(playerDecks[index]);
  });
  updateTableById(tableId, table);
}

/* Routes */

fastify.get("/hello", (request, response) => {
  response.send({ hello: "from server!" });
});

fastify.listen({ port: PORT }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  tables = {};
});
