import { connect } from "./util/connection";

(async () => {
  const { server, client } = await connect();

  if (server) {
    setInterval(() => {
      console.log("Sending message");
      console.log("clients: ", server.clients.size);
      const message = JSON.stringify({
        type: "message",
        data: "Hello, world!",
      });

      server.clients.forEach((client) => {
        client.send(message);
      });

      console.log("Message sent");
    }, 2000);

    server.on("connection", (ws) => {
      ws.on("message", (message) => {
        console.log(`Received message: ${message}`);
      });
    });
  }

  if (client) {
    client.on("message", (message) => {
      console.log(`Received message: ${message}`);
    });
  }
})();
