import ws281x from "rpi-ws281x-native";

export class RgbStrip {
  NUM_LEDS = 172; // Number of LEDs in the strip
  BRIGHTNESS = 255; // The brightness level of the LEDs (0-255)
  DATA_PIN = 18; // The GPIO pin that the strip is connected to

  channel = ws281x(this.NUM_LEDS, {
    stripType: ws281x.stripType.WS2812,
    gpio: this.DATA_PIN,
    brightness: this.BRIGHTNESS,
    invert: false,
  });
  colors = this.channel.array;
  backgroundColor = 0x000000;

  constructor() {}

  setBrightness(brightness: number) {
    this.channel.brightness = brightness;
    ws281x.render();
  }

  setPixelColor(
    pixelPositionPercent: number,
    colorSaturationPercent: number,
    red = 255,
    green = 255,
    blue = 255
  ) {
    if (!pixelPositionPercent) {
      console.error("No pixel position provided for setPixelColor()");
      return;
    }
    const pixel = Math.floor(pixelPositionPercent * this.NUM_LEDS);
    // color to set will be a blend of the background color and the provided color depending on the saturation
    const colorToSet =
      this.backgroundColor +
      Math.floor(
        ((red << 16) | (green << 8) | (blue - this.backgroundColor)) *
          (colorSaturationPercent / 100)
      );
    ws281x.render();
  }

  setBackgroundColor(red = 0, green = 0, blue = 0) {
    this.colors.fill((red << 16) | (green << 8) | blue);
    this.backgroundColor = (red << 16) | (green << 8) | blue;
    ws281x.render();
  }

  reset() {
    ws281x.reset();
  }
}
