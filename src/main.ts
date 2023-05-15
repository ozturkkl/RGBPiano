import { Connection } from "./util/websocket";
import { initializeMidi } from "./util/initializeMidi";
import { RgbStrip } from "./util/rbgStrip";

(async () => {
  const connection = new Connection();
  await connection.connect();

  const midi = new (await import("./util/midi")).Midi(connection);
  midi.openInput();

  const rgbStrip = new RgbStrip();
  rgbStrip.setBrightness(255);
  rgbStrip.setColor(0, 25, 0);

  connection.listen((message) => {
    console.log(message);
    if (message.type === "midi") {
      const { notePositionPercent, noteVelocityPercent } = message.message;
      rgbStrip.setPixelColor(
        notePositionPercent,
        0,
        255 * noteVelocityPercent,
        0
      );
    }
  });
})();
