import { Connection } from "./util/websocket";
import { initializeMidi } from "./util/initializeMidi";

(async () => {
  const connection = new Connection();
  await connection.connect();

  const midi = await initializeMidi(connection);
  midi?.openInput();

  connection.listen((message) => {
    console.log(message);
  });
})();
