import { Connection } from "./util/websocket";
import os from "os";
import { execSync } from "child_process";

(async () => {
  const connection = new Connection();
  await connection.connect();

  try{
    const midi = new (await import("./util/midi")).Midi(connection)
    await midi.openInput();
  }
  catch(e){
    console.error("Failed to open midi input:", e)
  }

  connection.listen((message) => {
    console.log(message);
  });
})();
