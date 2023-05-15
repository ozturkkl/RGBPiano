import ws281x from "rpi-ws281x-native";

export class RgbStrip {
  NUM_LEDS = 175; // Number of LEDs in the strip
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

  setPixelColor(pixelPositionPercent: number, red = 255, green = 255, blue = 255) {
    if (!pixelPositionPercent) {
      console.error("No pixel position provided for setPixelColor()");
      return;
    }
    const pixel = Math.floor(pixelPositionPercent * (this.NUM_LEDS - 1)) + 1;
    this.colors[pixel] = (red << 16) | (green << 8) | blue;
    ws281x.render();
  }

  setColor(red = 0, green = 0, blue = 0) {
    for (let i = 0; i < this.NUM_LEDS; i++) {
      this.setPixelColor(i, red, green, blue);
    }
  }

  reset() {
    ws281x.reset();
  }
}
