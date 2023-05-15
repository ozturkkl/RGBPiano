import { Connection } from "./util/websocket";
import { initializeMidi } from "./util/initializeMidi";
import { RgbStrip } from "./util/rbgStrip";

(async () => {
  const connection = new Connection();
  await connection.connect();

  const midi = await initializeMidi(connection);
  midi?.openInput();

  const rgbStrip = new RgbStrip();
  rgbStrip.setBrightness(255);

  connection.listen((message) => {
    console.log(message);
  });
})();
