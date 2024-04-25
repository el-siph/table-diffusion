import fastifyWS from "@fastify/websocket";
import Fastify from "fastify";
import { Actions } from "./src/actions.js";
import {
  addClientToMap,
  broadcast,
  divideDeckForTable,
  findOrCreateTableIdByCode,
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

fastify.register(fastifyWS, {
  options: {
    clientTracking: true,
  },
});

/* Sockets */
fastify.register(async function (fastify) {
  const fastifyServer = fastify.websocketServer;
  fastify.get("/dealer", { websocket: true }, (socket) => {
    socket.on("message", (message: messageBody) => {
      const { action, payload } = JSON.parse(message.toString());
      console.log("action", action);

      switch (action) {
        case Actions.joinTable:
          const randomPlayerId = crypto.randomUUID();
          const randomTableId = findOrCreateTableIdByCode(payload.tableCode);
          joinOrCreateTable(
            randomTableId,
            payload.tableCode,
            randomPlayerId,
            payload.playerName,
          );

          addClientToMap(randomTableId, socket);

          socket.send(
            JSON.stringify({
              tableId: randomTableId,
              tableCode: payload.tableCode,
              playerId: randomPlayerId,
              playerName: payload.playerName,
            }),
          );

          broadcast(
            fastifyServer,
            `{"message": "${payload.playerName} joined the Table."}`,
            randomTableId,
          );
          break;

        case Actions.generateTableDeck:
          generateDeckForTable(payload.tableId);

          if (payload.isShuffled) {
            shuffleDeckForTable(payload.tableId);
          }

          broadcast(
            fastifyServer,
            `{"message": "generated ${payload.isShuffled ? "shuffled " : ""}deck for ${payload.tableId}"}`,
            payload.tableId,
          );

          break;

        case Actions.shuffleTableDeck:
          shuffleDeckForTable(payload.tableId);
          broadcast(
            fastifyServer,
            `{"message": "shuffled deck for ${payload.tableId}"`,
            payload.tableId,
          );
          break;

        case Actions.divideTableDeck:
          divideDeckForTable(payload.tableId);
          broadcast(
            fastifyServer,
            `{"message": "divided deck for ${payload.tableId}"}`,
            payload.tableId,
          );
          break;

        case Actions.getTableState:
          const table: Table | undefined = getTableById(payload.tableId);
          broadcast(fastifyServer, JSON.stringify(table), payload.tableId);
          break;

        case Actions.getAllTables:
          broadcast(
            fastifyServer,
            JSON.stringify(getTables()),
            payload.tableId,
          );
          break;
      }
    });

    socket.send(`{"message": "Connected to dealer..."}`);

    socket.on("error", console.error);

    socket.on("close", () => {
      socket.send(`{"message": "Disconnected from websocket."}`);
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
