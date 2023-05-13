import { connect } from "./util/connection";
import WebSocket from "ws";

(async () => {
  const ws = (await connect()) as WebSocket.WebSocket;

  ws.on("midi", (message) => {
    console.log(`Message received: ${message}`);
  });

  // setInterval(() => {
  //   ws.emit("midi", "Hello, world!");
  // }, 1000);
})();
