import ws281x from "rpi-ws281x-native";
import color from "color";

export class RgbStrip {
  NUM_LEDS = 177; // Number of LEDs in the strip
  BRIGHTNESS = 255; // The brightness level of the LEDs (0-255)
  DATA_PIN = 18; // The GPIO pin that the strip is connected to

  channel = ws281x(this.NUM_LEDS, {
    stripType: ws281x.stripType.WS2812,
    gpio: this.DATA_PIN,
    brightness: this.BRIGHTNESS,
    invert: false,
  });
  colors = this.channel.array;
  backgroundColor = [0, 0, 0];

  constructor() {}

  setBrightness(brightness: number) {
    this.channel.brightness = brightness;
    ws281x.render();
  }

  setPixelColor(
    pixelPositionPercent: number,
    velocityPercent: number,
    red = 255,
    green = 255,
    blue = 255
  ) {
    if (!pixelPositionPercent) {
      console.error("No pixel position provided for setPixelColor()");
      return;
    }
    const pixelPosition = Math.round(
      (this.NUM_LEDS - 2) * (pixelPositionPercent / 100)
    ) + 1;

    const blendedColor = color.rgb(
      Math.round((red * velocityPercent) / 100) + (this.backgroundColor[0] * (100 - velocityPercent) / 100),
      Math.round((green * velocityPercent) / 100) + (this.backgroundColor[1] * (100 - velocityPercent) / 100),
      Math.round((blue * velocityPercent) / 100) + (this.backgroundColor[2] * (100 - velocityPercent) / 100)
    )
    
    this.colors[pixelPosition] = blendedColor.rgbNumber();
    ws281x.render();
  }

  setBackgroundColor(red = 0, green = 0, blue = 0) {
    this.backgroundColor = [red, green, blue];
    this.colors.fill(color.rgb(red, green, blue).rgbNumber());
    ws281x.render();
  }

  reset() {
    ws281x.reset();
  }
}
