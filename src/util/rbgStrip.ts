import ws281x from "rpi-ws281x-native";

export class RgbStrip {
  NUM_LEDS = 100; // The number of LEDs on the strip
  BRIGHTNESS = 128; // The brightness level of the LEDs (0-255)
  DATA_PIN = 18; // The GPIO pin that the strip is connected to

  channel = ws281x(this.NUM_LEDS, {
    stripType: ws281x.stripType.WS2812,
    gpio: this.DATA_PIN,
    brightness: this.BRIGHTNESS,
    invert: false,
  });
  colors = this.channel.array;

  constructor() {}

  setBrightness(brightness: number) {
    this.channel.brightness = brightness;
    ws281x.render();
  }

  setPixelColor(pixelPositionPercent: number, red: number, green: number, blue: number) {
    const pixel = Math.floor(pixelPositionPercent * this.NUM_LEDS);
    this.colors[pixel] = (red << 16) | (green << 8) | blue;
    ws281x.render();
  }

  setColor(red: number, green: number, blue: number) {
    for (let i = 0; i < this.NUM_LEDS; i++) {
      this.setPixelColor(i, red, green, blue);
    }
  }

  reset() {
    ws281x.reset();
  }
}
