import { execSync } from "child_process";
import { Connection } from "./websocket";

export async function initializeMidi(connection: Connection) {
  const armv6l = execSync("uname -a").toString().includes("armv6l");
  if (!armv6l) {
    const midi = new (await import("./midi")).Midi(connection);
    return midi;
  } else {
    console.log("Cannot initialize MIDI on armv6l");
    return null;
  }
}
