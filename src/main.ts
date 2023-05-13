import { connect } from "./util/connection";
import WebSocket from "ws";

(async () => {
  const ws = (await connect()) as WebSocket.WebSocket;

  ws.on("message", (message) => {
    console.log(`Message received: ${message}`);
  });
})();
