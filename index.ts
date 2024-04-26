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
  popPlayerToPile,
  popPlayerToPilePicked,
  popPlayerToPlayer,
  popPlayerToTable,
  popTableToPile,
  popTableToPlayer,
  shuffleDeckForTable,
  shufflePlayerDeck,
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
            JSON.stringify({
              message: `Player::${payload.playerName} joined the Table.`,
            }),
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
            JSON.stringify({
              message: `generated ${payload.isShuffled ? "shuffled " : ""}deck for Table::${payload.tableId}`,
            }),
            payload.tableId,
          );

          break;

        case Actions.shuffleTableDeck:
          shuffleDeckForTable(payload.tableId);
          broadcast(
            fastifyServer,
            JSON.stringify({
              message: `shuffled deck for Table::${payload.tableId}`,
            }),
            payload.tableId,
          );
          break;

        case Actions.divideTableDeck:
          divideDeckForTable(payload.tableId);
          broadcast(
            fastifyServer,
            JSON.stringify({
              message: `divided deck for Table::${payload.tableId}`,
            }),
            payload.tableId,
          );
          break;

        case Actions.popPlayerToPile:
          const ptpileCardCount = payload.cardCount ?? 1;
          popPlayerToPile(payload.tableId, payload.playerId, ptpileCardCount);
          broadcast(
            fastifyServer,
            JSON.stringify(
              {
                message: `${ptpileCardCount} card(s) moved to Table::${payload.tableId}'s activePile.`,
              },
              payload.tableId,
            ),
          );
          break;

        case Actions.popPlayerToPlayer:
          const ptplayerCardCount = payload.cardCount ?? 1;
          popPlayerToPlayer(
            payload.tableId,
            payload.playerIdSending,
            payload.playerIdReceiving,
            ptplayerCardCount,
          );
          broadcast(
            fastifyServer,
            JSON.stringify(
              {
                message: `${ptplayerCardCount} card(s) moved from Player::${payload.playerIdSending} to Player::${payload.playerIdReceiving}`,
              },
              payload.tableId,
            ),
          );
          break;

        case Actions.popPlayerToTable:
          const playerToTableCount = payload.cardCount ?? 1;
          popPlayerToTable(
            payload.tableId,
            payload.playerId,
            playerToTableCount,
          );

          broadcast(
            fastifyServer,
            JSON.stringify(
              {
                message: `${playerToTableCount} card(s) moved from Player::${payload.playerId} to Table::${payload.tableId}`,
              },
              payload.tableId,
            ),
          );
          break;

        case Actions.popTableToPlayer:
          const tableToPlayerCount = payload.cardCount ?? 1;
          popTableToPlayer(
            payload.tableId,
            payload.playerId,
            tableToPlayerCount,
          );
          broadcast(
            fastifyServer,
            JSON.stringify(
              {
                message: `${tableToPlayerCount} card(s) moved from Table::${payload.tableId} to Player::${payload.playerId}`,
              },
              payload.tableId,
            ),
          );
          break;

        case Actions.popTableToPile:
          const tableToPileCount = payload.cardCount ?? 1;
          popTableToPile(payload.tableId, tableToPileCount);
          broadcast(
            fastifyServer,
            JSON.stringify(
              {
                message: `${tableToPileCount} card(s) moved from Player::${payload.playerIdSending} to Player::${payload.playerIdReceiving}`,
              },
              payload.tableId,
            ),
          );
          break;

        case Actions.popPlayerToPilePicked:
          popPlayerToPilePicked(
            payload.tableId,
            payload.playerId,
            payload.cardAttributes,
          );
          broadcast(
            fastifyServer,
            JSON.stringify(
              {
                message: `Chosen card(s) moved from Player::${payload.playerId} to Table::${payload.tableId}'s activePile.`,
              },
              payload.tableId,
            ),
          );
          break;

        case Actions.shufflePlayerDeck:
          shufflePlayerDeck(payload.tableId, payload.playerId);
          broadcast(
            fastifyServer,
            JSON.stringify(
              {
                message: `Shuffled CardDeck for Player::${payload.playerId}.`,
              },
              payload.tableId,
            ),
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

    socket.send(JSON.stringify({ message: "Connected to dealer..." }));

    socket.on("error", console.error);

    socket.on("close", () => {
      socket.send(JSON.stringify({ message: "Disconnected from websocket." }));
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
