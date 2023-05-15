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
  rgbStrip.setBackgroundColor(0, 5, 5);

  connection.listen((message) => {
    console.log(message);
    if (message.type === "midi" && message?.data) {
      const { notePositionRatio, noteVelocityRatio, midiChannel } =
        message.data;
      if (midiChannel === 144) {
        rgbStrip.setPixelColor(
          notePositionRatio,
          noteVelocityRatio,
          0,
          255,
          255
        );
      }
    }
  });
})();
