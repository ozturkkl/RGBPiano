import { Connection } from "./util/websocket";
import { initializeMidi } from "./util/midi";

(async () => {
  const connection = new Connection();
  await connection.connect();

  const midi = await initializeMidi(connection);
  if (midi) {
    midi.openInput();
  }

  connection.listen((message) => {
    console.log(message);
  });
})();
