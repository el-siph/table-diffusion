import { Suits } from "./models/PlayingCard.js";

export interface MessageBody {
  action: string;
  payload: {
    [key: string]: string;
  };
}

export interface JoinTableResponse {
  tableId: string;
  tableCode: string;
  playerId: string;
}

export interface CardAttribute {
  pips: number;
  suit: Suits;
}

export const enum BroadcastTypes {
  confirmation = "confirmation",
  registerData = "registerData",
  tableData = "tableData",
  playerData = "playerData",
}

export interface BroadcastMessage {
  responseType: BroadcastTypes;
  payload?: {} | [];
}
