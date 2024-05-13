import fastifyWS from "@fastify/websocket";
import Fastify from "fastify";
import { Actions } from "./src/actions.js";
import {
  addClientToMap,
  broadcast,
  dismissSlap,
  divideDeckForTable,
  findOrCreatePlayerIdByName,
  findOrCreateTableIdByCode,
  generateDeckForTable,
  getTableById,
  getTables,
  initializeTables,
  joinOrCreateTable,
  popPileToPlayer,
  popPileToTable,
  popPlayerToPile,
  popPlayerToPilePicked,
  popPlayerToPlayer,
  popPlayerToTable,
  popTableToPile,
  popTableToPlayer,
  resetAllDecks,
  shuffleDeckForTable,
  shufflePileForTable,
  shufflePlayerDeck,
  slapDeck,
  swapPlayersOwnDecks,
} from "./src/functions.js";
import Table from "./src/models/Table.js";
import { BroadcastTypes, MessageBody } from "./src/interfaces.js";

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;
const HOST: string = process.env.HOST ?? "0.0.0.0";

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

  fastifyServer.on("upgrade", (request, socket, head) => {
    const origin = request && request.headers && request.headers.origin;
    const corsRegex = /^https?:\/\/(.*\.?)abc\.com(:\d+)?\/$/g;
    if (origin && origin.match(corsRegex) != null) {
      fastifyServer.handleUpgrade(request, socket, head, (ws) => {
        fastifyServer.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  fastify.get("/dealer", { websocket: true }, (socket) => {
    socket.on("message", (message: MessageBody) => {
      const { action, payload } = JSON.parse(message.toString());
      console.log("action", action);

      switch (action) {
        case Actions.joinTable:
          const randomTableId = findOrCreateTableIdByCode(payload.tableCode);
          const { playerId: randomPlayerId, wasFound } =
            findOrCreatePlayerIdByName(randomTableId, payload.playerName);

          if (!wasFound) {
            joinOrCreateTable(
              randomTableId,
              payload.tableCode,
              randomPlayerId,
              payload.playerName,
            );
          }

          addClientToMap(randomTableId, socket);

          socket.send(
            JSON.stringify({
              responseType: BroadcastTypes.registerData,
              payload: {
                _tableId: randomTableId,
                _tableCode: payload.tableCode,
                _playerId: randomPlayerId,
                _playerName: payload.playerName,
              },
            }),
          );

          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `Player::${payload.playerName} joined the Table.`,
              },
            },
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
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `generated ${payload.isShuffled ? "shuffled " : ""}deck for Table::${payload.tableId}`,
              },
            },
            payload.tableId,
          );

          break;

        case Actions.shuffleTableDeck:
          shuffleDeckForTable(payload.tableId);
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `shuffled deck for Table::${payload.tableId}`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.shuffleTablePile:
          shufflePileForTable(payload.tableId);
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `shuffled deck for Table::${payload.tableId}`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.divideTableDeck:
          divideDeckForTable(payload.tableId);
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `divided deck for Table::${payload.tableId}`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.popPlayerToPile:
          const ptpileCardCount = payload.cardCount ?? 1;
          popPlayerToPile(payload.tableId, payload.playerId, ptpileCardCount);
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `${ptpileCardCount} card(s) moved to Table::${payload.tableId}'s activePile.`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.popPlayerToPlayer:
          const ptplayerCardCount = payload.cardCount ?? 1;
          popPlayerToPlayer(
            payload.tableId,
            payload.playerIdSending,
            payload.playerIdReceiving,
            ptplayerCardCount,
            payload.isFromPassiveDeck ?? false,
            payload.isToPassiveDeck ?? false,
          );
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `${ptplayerCardCount} card(s) moved from Player::${payload.playerIdSending} to Player::${payload.playerIdReceiving}`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.popPlayerToTable:
          const playerToTableCount = payload.cardCount ?? 1;
          popPlayerToTable(
            payload.tableId,
            payload.playerId,
            playerToTableCount,
            payload.isFromPassiveDeck ?? false,
          );

          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `${playerToTableCount} card(s) moved from Player::${payload.playerId} to Table::${payload.tableId}`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.popTableToPlayer:
          const tableToPlayerCount = payload.cardCount ?? 1;
          popTableToPlayer(
            payload.tableId,
            payload.playerId,
            tableToPlayerCount,
            payload.isToPassiveDeck ?? false,
          );
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `${tableToPlayerCount} card(s) moved from Table::${payload.tableId} to Player::${payload.playerId}`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.popPileToPlayer:
          const pileToPlayerCount = payload.cardCount ?? 1;
          popPileToPlayer(
            payload.tableId,
            payload.playerId,
            pileToPlayerCount,
            payload.isToPassiveDeck ?? false,
          );
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `${pileToPlayerCount} card(s) moved from Table::${payload.tableId} to Player::${payload.playerId}`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.popPileToTable:
          const pileToTableCount = payload.cardCount ?? 1;
          popPileToTable(payload.tableId, pileToTableCount);
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `${pileToTableCount} card(s) moved from Table::${payload.tableId}'s pile to its deck`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.swapPlayersOwnDecks:
          swapPlayersOwnDecks(payload.tableId, payload.playerId);
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `${payload.playerId}'s' card(s) between their Decks.`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.popTableToPile:
          const tableToPileCount = payload.cardCount ?? 1;
          popTableToPile(payload.tableId, tableToPileCount);
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `${tableToPileCount} card(s) moved from Player::${payload.playerIdSending} to Player::${payload.playerIdReceiving}`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.popPlayerToPilePicked:
          popPlayerToPilePicked(
            payload.tableId,
            payload.playerId,
            payload.cardAttributes,
            payload.isFromPassiveDeck ?? false,
          );
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `Chosen card(s) moved from Player::${payload.playerId} to Table::${payload.tableId}'s activePile.`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.shufflePlayerDeck:
          shufflePlayerDeck(
            payload.tableId,
            payload.playerId,
            payload.isPassiveDeck ?? false,
          );
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `Shuffled CardDeck for Player::${payload.playerId}.`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.slapDeck:
          slapDeck(payload.tableId, payload.playerId, payload.wasValid);
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `Deck slapped ${payload.wasValid ? "validly" : "invalidly"} by Player::${payload.playerId}.`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.dismissSlap:
          dismissSlap(payload.tableId);
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `Deck slap dismissed.`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.resetTableDecks:
          resetAllDecks(payload.tableId);
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.confirmation,
              payload: {
                message: `Reset all Table CardDecks.`,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.getTableState:
          const table: Table | undefined = getTableById(payload.tableId);
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.tableData,
              payload: {
                table,
              },
            },
            payload.tableId,
          );
          break;

        case Actions.getAllTables:
          broadcast(
            fastifyServer,
            {
              responseType: BroadcastTypes.tableData,
              payload: {
                tables: getTables(),
              },
            },
            payload.tableId,
          );
          break;
      }
    });

    socket.send(
      JSON.stringify({
        responseType: BroadcastTypes.confirmation,
        payload: { message: "Connected to dealer..." },
      }),
    );

    socket.on("error", console.error);

    socket.on("close", () => {
      socket.send(
        JSON.stringify({
          responseType: BroadcastTypes.confirmation,
          payload: { message: "Disconnected from websocket." },
        }),
      );
    });
  });
});

fastify.get("/", (req, reply) => {
  reply.send("Table Diffusions expects WebSocket requests.");
});

fastify.listen({ port: PORT, host: HOST }, (error) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  initializeTables();
});
