import { connect } from "./util/connection";
import WebSocket from "ws";

(async () => {
  const ws = await connect();

  // ws.on("midi", (message: any) => {
  //   console.log(`Message received: ${message}`);
  // });

  // setInterval(() => {
  //   console.log("Sending message");
  //   ws.emit("midi", { message: "Hello, world!" });
  // }, 1000);
})();
