import { Connection } from "./util/websocket";
import { Midi } from "./util/midi";

(async () => {
  const connection = new Connection();
  await connection.connect();

  const midi = new Midi(connection);
  await midi.openInput();
})();
