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
  rgbStrip.setBackgroundColor(0, 15, 15);

  connection.listen((message) => {
    console.log(message);
    if (message.type === "midi" && message?.data) {
      const { notePositionPercent, noteVelocityPercent } = message.data;
      rgbStrip.setPixelColor(
        notePositionPercent,
        noteVelocityPercent,
        0,
        255,
        255
      );
    }
  });
})();
