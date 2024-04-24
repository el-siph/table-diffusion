import fastifyWS from "@fastify/websocket";
import Fastify from "fastify";
import Table from "./models/Table";
import { actions } from "./src/actions";
import {
  divideDeckForTable,
  generateDeckForTable,
  getTableById,
  getTables,
  initializeTables,
  joinOrCreateTable,
  shuffleDeckForTable,
} from "./src/functions";

const PORT = parseInt(process.env.PORT) ?? 8080;

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyWS);

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
          const table = getTableById(payload.tableId);
          socket.send(JSON.stringify(table));
          break;

        case actions.getAllTables:
          socket.send(JSON.stringify(getTables()));
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

/* Routes */

fastify.get("/hello", (request, response) => {
  response.send({ hello: "from server!" });
});

fastify.listen({ port: PORT }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  initializeTables();
});
