import { Actions } from "./src/actions.js";
import {
  emitToTable,
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
import { Server } from "socket.io";
import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8080;

const server = require("https").createServer(fastify.server);
const io = new Server(server, {
  cors: {
    origin: `${process.env.CLIENT_URL}`,
  },
});

/* Sockets */
io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("message", ({ action, payload }: MessageBody) => {
    switch (action) {
      case Actions.joinTable:
        const randomTableId = findOrCreateTableIdByCode(payload.tableCode!);
        const { playerId: randomPlayerId, wasFound } =
          findOrCreatePlayerIdByName(randomTableId, payload.playerName!);

        if (!wasFound) {
          joinOrCreateTable(
            randomTableId,
            payload.tableCode!,
            randomPlayerId,
            payload.playerName!,
          );
        }

        socket.emit(
          "response",
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

        socket.join(randomTableId);

        emitToTable(io, randomTableId, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `Player::${payload.playerName} joined the Table.`,
          },
        });

        break;

      case Actions.generateTableDeck:
        generateDeckForTable(payload.tableId!);

        if (payload.isShuffled) {
          shuffleDeckForTable(payload.tableId!);
        }

        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `generated ${payload.isShuffled ? "shuffled " : ""}deck for Table::${payload.tableId}`,
          },
        });

        break;

      case Actions.shuffleTableDeck:
        shuffleDeckForTable(payload.tableId!);
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `shuffled deck for Table::${payload.tableId}`,
          },
        });
        break;

      case Actions.shuffleTablePile:
        shufflePileForTable(payload.tableId!);
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `shuffled deck for Table::${payload.tableId}`,
          },
        });
        break;

      case Actions.divideTableDeck:
        divideDeckForTable(payload.tableId!);
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `divided deck for Table::${payload.tableId}`,
          },
        });
        break;

      case Actions.popPlayerToPile:
        const ptpileCardCount = payload.cardCount ?? 1;
        popPlayerToPile(payload.tableId!, payload.playerId!, ptpileCardCount);
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `${ptpileCardCount} card(s) moved to Table::${payload.tableId}'s activePile.`,
          },
        });
        break;

      case Actions.popPlayerToPlayer:
        const ptplayerCardCount = payload.cardCount ?? 1;
        popPlayerToPlayer(
          payload.tableId!,
          payload.playerIdSending!,
          payload.playerIdReceiving!,
          ptplayerCardCount,
          payload.isFromPassiveDeck ?? false,
          payload.isToPassiveDeck ?? false,
        );
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `${ptplayerCardCount} card(s) moved from Player::${payload.playerIdSending} to Player::${payload.playerIdReceiving}`,
          },
        });
        break;

      case Actions.popPlayerToTable:
        const playerToTableCount = payload.cardCount ?? 1;
        popPlayerToTable(
          payload.tableId!,
          payload.playerId!,
          playerToTableCount,
          payload.isFromPassiveDeck ?? false,
        );

        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `${playerToTableCount} card(s) moved from Player::${payload.playerId} to Table::${payload.tableId}`,
          },
        });
        break;

      case Actions.popTableToPlayer:
        const tableToPlayerCount = payload.cardCount ?? 1;
        popTableToPlayer(
          payload.tableId!,
          payload.playerId!,
          tableToPlayerCount,
          payload.isToPassiveDeck ?? false,
        );
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `${tableToPlayerCount} card(s) moved from Table::${payload.tableId} to Player::${payload.playerId}`,
          },
        });
        break;

      case Actions.popPileToPlayer:
        const pileToPlayerCount = payload.cardCount ?? 1;
        popPileToPlayer(
          payload.tableId!,
          payload.playerId!,
          pileToPlayerCount,
          payload.isToPassiveDeck ?? false,
        );
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `${pileToPlayerCount} card(s) moved from Table::${payload.tableId} to Player::${payload.playerId}`,
          },
        });
        break;

      case Actions.popPileToTable:
        const pileToTableCount = payload.cardCount ?? 1;
        popPileToTable(payload.tableId!, pileToTableCount);
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `${pileToTableCount} card(s) moved from Table::${payload.tableId}'s pile to its deck`,
          },
        });
        break;

      case Actions.swapPlayersOwnDecks:
        swapPlayersOwnDecks(payload.tableId!, payload.playerId!);
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `${payload.playerId}'s' card(s) between their Decks.`,
          },
        });
        break;

      case Actions.popTableToPile:
        const tableToPileCount = payload.cardCount ?? 1;
        popTableToPile(payload.tableId!, tableToPileCount);
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `${tableToPileCount} card(s) moved from Player::${payload.playerIdSending} to Player::${payload.playerIdReceiving}`,
          },
        });
        break;

      case Actions.popPlayerToPilePicked:
        popPlayerToPilePicked(
          payload.tableId!,
          payload.playerId!,
          payload.cardAttributes!,
          payload.isFromPassiveDeck ?? false,
        );
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `Chosen card(s) moved from Player::${payload.playerId} to Table::${payload.tableId}'s activePile.`,
          },
        });
        break;

      case Actions.shufflePlayerDeck:
        shufflePlayerDeck(
          payload.tableId!,
          payload.playerId!,
          payload.isPassiveDeck ?? false,
        );
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `Shuffled CardDeck for Player::${payload.playerId}.`,
          },
        });
        break;

      case Actions.slapDeck:
        slapDeck(payload.tableId!, payload.playerId!, payload.wasValid!);
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `Deck slapped ${payload.wasValid ? "validly" : "invalidly"} by Player::${payload.playerId}.`,
          },
        });
        break;

      case Actions.dismissSlap:
        dismissSlap(payload.tableId!);
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `Deck slap dismissed.`,
          },
        });
        break;

      case Actions.resetTableDecks:
        resetAllDecks(payload.tableId!);
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.confirmation,
          payload: {
            message: `Reset all Table CardDecks.`,
          },
        });
        break;

      case Actions.getTableState:
        const table: Table | undefined = getTableById(payload.tableId!);
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.tableData,
          payload: {
            table,
          },
        });
        break;

      case Actions.getAllTables:
        emitToTable(io, payload.tableId!, {
          responseType: BroadcastTypes.tableData,
          payload: {
            tables: getTables(),
          },
        });
        break;
    }
    socket.on("disconnect", () => {
      console.log("Client left");
    });
  });
});

fastify.get("/", (req, reply) => {
  reply.send("Table Diffusion expects WebSocket requests.");
});

server.listen(PORT, () => {
  console.log("Server listening on port", PORT);
  initializeTables();
});
