import fastifyWS from "@fastify/websocket";
import Fastify from "fastify";
import { Actions } from "./src/actions";
import {
  divideDeckForTable,
  generateDeckForTable,
  getTableById,
  getTables,
  initializeTables,
  joinOrCreateTable,
  shuffleDeckForTable,
} from "./src/functions";
import Table from "./src/models/Table";

const PORT = parseInt(process.env.PORT!) ?? 8080;

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyWS);

interface messageBody {
  action: string;
  payload: {
    [key: string]: string;
  };
}

/* Sockets */
fastify.register(async function (fastify) {
  fastify.get("/dealer", { websocket: true }, (socket, request) => {
    socket.on("message", (message: messageBody) => {
      const { action, payload } = JSON.parse(message.toString());
      console.log("action", action);

      switch (action) {
        case Actions.joinTable:
          const playerId = crypto.randomUUID();
          joinOrCreateTable(payload.tableId, playerId, payload.playerName);
          socket.send(
            JSON.stringify({
              tableId: payload.tableId,
              playerId,
            }),
          );
          break;

        case Actions.generateTableDeck:
          generateDeckForTable(payload.tableId);

          if (payload.isShuffled) {
            shuffleDeckForTable(payload.tableId);
          }

          socket.send(
            `generated ${payload.isShuffled ? "shuffled " : ""}deck for ${payload.tableId}`,
          );
          break;

        case Actions.shuffleTableDeck:
          shuffleDeckForTable(payload.tableId);
          socket.send(`shuffled deck for ${payload.tableId}`);
          break;

        case Actions.divideTableDeck:
          divideDeckForTable(payload.tableId);
          socket.send(`divided deck for ${payload.tableId}`);
          break;

        case Actions.getTableState:
          /** @type Table */
          const table = getTableById(payload.tableId);
          socket.send(JSON.stringify(table));
          break;

        case Actions.getAllTables:
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