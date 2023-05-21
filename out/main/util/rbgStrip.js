"use strict";
exports.__esModule = true;
exports.RgbStrip = void 0;
var ws281x = require("rpi-ws281x-native");
var color = require("color");
var RgbStrip = /** @class */ (function () {
    function RgbStrip() {
        this.NUM_LEDS = 177; // Number of LEDs in the strip
        this.BRIGHTNESS = 255; // The brightness level of the LEDs (0-255)
        this.DATA_PIN = 18; // The GPIO pin that the strip is connected to
        this.channel = ws281x(this.NUM_LEDS, {
            stripType: ws281x.stripType.WS2812,
            gpio: this.DATA_PIN,
            brightness: this.BRIGHTNESS,
            invert: false
        });
        this.colors = this.channel.array;
        this.backgroundColor = [0, 0, 0];
    }
    RgbStrip.prototype.setBrightness = function (brightness) {
        this.channel.brightness = brightness;
        ws281x.render();
    };
    RgbStrip.prototype.setPixelColor = function (pixelPositionRatio, velocityRatio, red, green, blue) {
        if (velocityRatio === void 0) { velocityRatio = 1; }
        if (red === void 0) { red = 255; }
        if (green === void 0) { green = 255; }
        if (blue === void 0) { blue = 255; }
        var blendedColor = color.rgb(Math.round(red * velocityRatio) + Math.round(this.backgroundColor[0] * (1 - velocityRatio)), Math.round(green * velocityRatio) + Math.round(this.backgroundColor[1] * (1 - velocityRatio)), Math.round(blue * velocityRatio) + Math.round(this.backgroundColor[2] * (1 - velocityRatio)));
        // if no pixel position is specified, set all pixels to the same color
        if (pixelPositionRatio === undefined) {
            this.colors.fill(blendedColor.rgbNumber());
        }
        else {
            var pixelPosition = Math.round((this.NUM_LEDS - 2) * pixelPositionRatio) + 1;
            this.colors[pixelPosition] = blendedColor.rgbNumber();
        }
        ws281x.render();
    };
    RgbStrip.prototype.setBackgroundColor = function (red, green, blue) {
        if (red === void 0) { red = 0; }
        if (green === void 0) { green = 0; }
        if (blue === void 0) { blue = 0; }
        this.backgroundColor = [red, green, blue];
        this.colors.fill(color.rgb(red, green, blue).rgbNumber());
        ws281x.render();
    };
    RgbStrip.prototype.reset = function () {
        ws281x.reset();
    };
    return RgbStrip;
}());
exports.RgbStrip = RgbStrip;
