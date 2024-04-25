export interface messageBody {
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
