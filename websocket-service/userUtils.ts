import WebSocket from "ws";

const clients: Map<string, WebSocket> = new Map();

export const addClient = (userId: string, ws: WebSocket) => {
  clients.set(userId, ws);
};

export const removeClient = (userId: string) => {
  clients.delete(userId);
};

export const handleNewMessageEvent = (event: any) => {
  const { data } = event;
  const recipientId = data.recipient;

  const client = clients.get(recipientId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};

