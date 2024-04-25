import fastifyWS from "@fastify/websocket";
import Fastify from "fastify";
import { Actions } from "./src/actions.js";
import {
  divideDeckForTable,
  generateDeckForTable,
  getTableById,
  getTables,
  initializeTables,
  joinOrCreateTable,
  shuffleDeckForTable,
} from "./src/functions.js";
import Table from "./src/models/Table.js";
import { messageBody } from "./src/interfaces.js";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyWS);

/* Sockets */
fastify.register(async function (fastify) {
  fastify.get("/dealer", { websocket: true }, (socket) => {
    socket.on("message", (message: messageBody) => {
      const { action, payload } = JSON.parse(message.toString());
      console.log("action", action);

      switch (action) {
        case Actions.joinTable:
          const randomPlayerId = crypto.randomUUID();
          const randomTableId = crypto.randomUUID();
          joinOrCreateTable(
            randomTableId,
            payload.tableCode,
            randomPlayerId,
            payload.playerName,
          );
          socket.send(
            JSON.stringify({
              tableId: randomTableId,
              playerId: randomPlayerId,
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
          const table: Table | undefined = getTableById(payload.tableId);
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

fastify.listen({ port: PORT }, (error) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  initializeTables();
});
