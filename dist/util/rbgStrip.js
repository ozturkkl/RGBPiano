"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RgbStrip = void 0;
const rpi_ws281x_native_1 = __importDefault(require("rpi-ws281x-native"));
class RgbStrip {
    constructor() {
        this.NUM_LEDS = 10; // The number of LEDs on the strip
        this.BRIGHTNESS = 128; // The brightness level of the LEDs (0-255)
        this.DATA_PIN = 18; // The GPIO pin that the strip is connected to
        this.channel = (0, rpi_ws281x_native_1.default)(this.NUM_LEDS, {
            stripType: rpi_ws281x_native_1.default.stripType.WS2812,
            gpio: this.DATA_PIN,
            brightness: this.BRIGHTNESS,
            invert: false,
        });
        this.colors = this.channel.array;
    }
    setBrightness(brightness) {
        this.channel.brightness = brightness;
        rpi_ws281x_native_1.default.render();
    }
    setPixelColor(pixel, red, green, blue) {
        this.colors[pixel] = (red << 16) | (green << 8) | blue;
        rpi_ws281x_native_1.default.render();
    }
    setColor(red, green, blue) {
        for (let i = 0; i < this.NUM_LEDS; i++) {
            this.setPixelColor(i, red, green, blue);
        }
    }
    reset() {
        rpi_ws281x_native_1.default.reset();
    }
}
exports.RgbStrip = RgbStrip;
