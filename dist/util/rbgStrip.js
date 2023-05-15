"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RgbStrip = void 0;
const rpi_ws281x_native_1 = __importDefault(require("rpi-ws281x-native"));
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
    setPixelColor(pixelPositionPercent, colorSaturationPercent, red = 255, green = 255, blue = 255) {
        if (!pixelPositionPercent) {
            console.error("No pixel position provided for setPixelColor()");
            return;
        }
        const pixel = Math.floor(pixelPositionPercent * this.NUM_LEDS);
        // color to set will be a blend of the background color and the provided color depending on the saturation
        const colorToSet = ((this.backgroundColor[0] * (100 - colorSaturationPercent)) / 100 +
            (red * colorSaturationPercent) / 100) *
            65536 +
            ((this.backgroundColor[1] * (100 - colorSaturationPercent)) / 100 +
                (green * colorSaturationPercent) / 100) *
                256 +
            ((this.backgroundColor[2] * (100 - colorSaturationPercent)) / 100 +
                (blue * colorSaturationPercent) / 100);
        this.colors[pixel] = colorToSet;
        rpi_ws281x_native_1.default.render();
    }
    setBackgroundColor(red = 0, green = 0, blue = 0) {
        this.colors.fill((red << 16) | (green << 8) | blue);
        this.backgroundColor = [red, green, blue];
        rpi_ws281x_native_1.default.render();
    }
    reset() {
        rpi_ws281x_native_1.default.reset();
    }
}
exports.RgbStrip = RgbStrip;
