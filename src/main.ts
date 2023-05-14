import { Connection } from "./util/websocket";

(async () => {
  const connection = new Connection();
  await connection.connect();

  setInterval(() => {
    connection.send("Hello, world!");
  }, 2000);

  connection.listen((message) => {
    console.log(`Received message: ${message}`);
  });
  
})();
