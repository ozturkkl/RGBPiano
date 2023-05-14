import { Connection } from "./util/websocket";
import os from "os";
import { execSync } from "child_process";

(async () => {
  const connection = new Connection();
  await connection.connect();

  try {
    console.log("trying to import midi");
    const midiImport = await import("./util/midi");
    console.log("midi imported");
    const midi = new midiImport.Midi(connection);
    console.log("midi created");
    await midi.openInput();
  } catch (e) {
    console.error("Failed to open midi input:", e);
  }

  connection.listen((message) => {
    console.log(message);
  });
})();
