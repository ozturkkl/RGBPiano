import { connect } from "./util/connection";

(async () => {
  const ws = await connect();
  // console.log(ws);

  //   ws.on("message", (message) => {
  //     console.log(`Message received: ${message}`);
  //   });

  //   ws.on("close", () => {
  //     console.log("Disconnected");
  //   });

  //   ws.send("Hello, world!");
})();
