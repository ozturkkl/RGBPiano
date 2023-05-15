import { Connection } from "./util/websocket";
import { RgbStrip } from "./util/rbgStrip";
import { Midi } from "./util/midi";

const BACKGROUND_COLOR = [0, 2, 2];
const COLOR = [0, 255, 255];

(async () => {
  const connection = new Connection();
  await connection.connect();

  const midi = new Midi(connection);
  midi.openInput();

  const rgbStrip = new RgbStrip();
  rgbStrip.setBrightness(255);
  rgbStrip.setBackgroundColor(...BACKGROUND_COLOR);

  connection.listen((message) => {
    console.log(message);
    if (message.type === "midi" && message?.data) {
      const { notePositionRatio, noteVelocityRatio, midiChannel } =
        message.data;

      // note
      if (midiChannel === 144) {
        rgbStrip.setPixelColor(
          notePositionRatio,
          noteVelocityRatio === 0 ? 0 : 1,
          ...COLOR
        );
      }

      // pedal
      if (midiChannel === 176) {
        // disabled until other notes disappearing is fixed
        // rgbStrip.setBackgroundColor(
        //   ...BACKGROUND_COLOR.map((c) => c * (noteVelocityRatio === 1 ? 2 : 1))
        // );
      }
    }
  });
})();
