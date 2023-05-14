import { Connection } from "./util/websocket";

(async () => {
  const connection = new Connection();
  await connection.connect();

  try {
    const midiModule = await import("./util/midi");
    const midi = new midiModule.Midi(connection);
    await midi.openInput();
  } catch (e) {
    console.error("Failed to open midi input:", e);
  }

  connection.listen((message) => {
    console.log(message);
  });
})();
