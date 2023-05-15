"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RgbStrip = void 0;
const rpi_ws281x_native_1 = __importDefault(require("rpi-ws281x-native"));
const color_1 = __importDefault(require("color"));
class RgbStrip {
    constructor() {
        this.NUM_LEDS = 177; // Number of LEDs in the strip
        this.BRIGHTNESS = 255; // The brightness level of the LEDs (0-255)
        this.DATA_PIN = 18; // The GPIO pin that the strip is connected to
        this.channel = (0, rpi_ws281x_native_1.default)(this.NUM_LEDS, {
            stripType: rpi_ws281x_native_1.default.stripType.WS2812,
            gpio: this.DATA_PIN,
            brightness: this.BRIGHTNESS,
            invert: false,
        });
        this.colors = this.channel.array;
        this.backgroundColor = [0, 0, 0];
    }
    setBrightness(brightness) {
        this.channel.brightness = brightness;
        rpi_ws281x_native_1.default.render();
    }
    setPixelColor(pixelPositionRatio, velocityRatio = 1, red = 255, green = 255, blue = 255) {
        const blendedColor = color_1.default.rgb(Math.round(red * velocityRatio) +
            Math.round(this.backgroundColor[0] * (1 - velocityRatio)), Math.round(green * velocityRatio) +
            Math.round(this.backgroundColor[1] * (1 - velocityRatio)), Math.round(blue * velocityRatio) +
            Math.round(this.backgroundColor[2] * (1 - velocityRatio)));
        // if no pixel position is specified, set all pixels to the same color
        if (pixelPositionRatio === undefined) {
            this.colors.fill(blendedColor.rgbNumber());
        }
        else {
            const pixelPosition = Math.round((this.NUM_LEDS - 2) * pixelPositionRatio) + 1;
            this.colors[pixelPosition] = blendedColor.rgbNumber();
        }
        rpi_ws281x_native_1.default.render();
    }
    setBackgroundColor(red = 0, green = 0, blue = 0) {
        this.backgroundColor = [red, green, blue];
        this.colors.fill(color_1.default.rgb(red, green, blue).rgbNumber());
        rpi_ws281x_native_1.default.render();
    }
    reset() {
        rpi_ws281x_native_1.default.reset();
    }
}
exports.RgbStrip = RgbStrip;
