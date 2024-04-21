import Fastify from "fastify";
import Table from "./models/Table";
import Player from "./models/Player";
import CardDeck from "./models/CardDeck";

const fastify = Fastify({
  logger: true,
});

let tables = {};

/* Functions */

/**
 * @param {string} tableId - string identifier to join room (if exists)
 * @param {string} playerId - string indentifier to join room as player
 */
function joinOrCreateTable(tableId, playerId) {
  /** @type Table */
  let updatedTable;

  if (!tables[tableId]) {
    updatedTable = new Table(tableId);
    updatedTable.cardDeck = CardDeck.generateDeck();
  } else {
    updatedTable = structuredClone(tables[tableId]);
  }

  if (updatedTable.players.includes(playerId)) {
    // emit username taken
  } else {
    const newPlayer = new Player(playerId);
    updatedTable.addPlayer(newPlayer);
  }

  tables[tableId] = updatedTable;
}

/* Routes */

fastify.get("/", (request, response) => {
  response.send({ hello: "from server!" });
});

fastify.get("/test", (request, response) => {
  joinOrCreateTable("testTableId", "testPlayerId");
  response.send({ tables });
});

fastify.listen({ port: 3000 }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});
