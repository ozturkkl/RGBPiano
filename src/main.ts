import { Connection } from "./util/websocket";
import os from "os";

(async () => {
  // const connection = new Connection();
  // await connection.connect();

  const arch = os.arch();
  console.log(`Running on ${arch}`);

  const cpus = os.cpus();
  console.log(`CPU count: ${cpus.length}`);

  const platform = os.platform();
  console.log(`Platform: ${platform}`);

  const machine = os.machine();
  console.log(`Machine: ${machine}`);

  const x = os.type();
  console.log(`Type: ${x}`);
  

  // try{
  //   const midi = new (await import("./util/midi")).Midi(connection)
  //   await midi.openInput();
  // }
  // catch(e){
  //   console.error("Failed to open midi input:", e)
  // }

  // connection.listen((message) => {
  //   console.log(message);
  // });
})();
