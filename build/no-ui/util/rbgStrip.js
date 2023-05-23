"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.RgbStrip = void 0;
var rpi_ws281x_native_1 = __importDefault(require("rpi-ws281x-native"));
var config_1 = require("./config");
var RgbStrip = /** @class */ (function () {
    function RgbStrip() {
        var _this = this;
        this.channel = (0, rpi_ws281x_native_1["default"])(config_1.NUM_LEDS, {
            gpio: config_1.DATA_PIN,
            brightness: (0, config_1.getConfig)().BRIGHTNESS * 255,
            invert: false
        });
        this.colors = {};
        (0, config_1.onConfigUpdated)(function (updatedProperties) {
            if (updatedProperties.BRIGHTNESS) {
                _this.setBrightness(updatedProperties.BRIGHTNESS);
            }
            if (updatedProperties.BACKGROUND_COLOR) {
                _this.setBackgroundColor(updatedProperties.BACKGROUND_COLOR);
            }
        });
        this.setBackgroundColor((0, config_1.getConfig)().BACKGROUND_COLOR);
    }
    RgbStrip.prototype.setBrightness = function (brightness) {
        this.channel.brightness = brightness * 255;
        this.render();
    };
    RgbStrip.prototype.setBackgroundColor = function (_a) {
        var red = _a[0], green = _a[1], blue = _a[2];
        this.fillColors([red, green, blue]);
        this.render();
    };
    RgbStrip.prototype.setStripColor = function (positionRatio, velocityRatio, _a) {
        if (velocityRatio === void 0) { velocityRatio = 1; }
        var _b = _a === void 0 ? (0, config_1.getConfig)().COLOR : _a, red = _b[0], green = _b[1], blue = _b[2];
        var blendedColor = this.getBlendedRGB([red, green, blue], (0, config_1.getConfig)().BACKGROUND_COLOR, velocityRatio);
        // if no pixel position is specified, set all pixels to the same color
        if (positionRatio === undefined) {
            this.fillColors(blendedColor, false);
        }
        else {
            var colorPosition = Math.floor(positionRatio * config_1.NUM_LEDS);
            this.setColor(colorPosition, blendedColor);
        }
        this.render();
    };
    RgbStrip.prototype.reset = function () {
        this.fillColors((0, config_1.getConfig)().BACKGROUND_COLOR, false);
        this.render();
    };
    RgbStrip.prototype.handleNotePress = function (data) {
        // note
        if (data.midiChannel === 144) {
            if ((0, config_1.getConfig)().CONSTANT_VELOCITY) {
                data.noteVelocityRatio = data.noteVelocityRatio === 0 ? 0 : 1;
            }
            this.setStripColor(data.notePositionRatio, data.noteVelocityRatio);
        }
        // pedal
        if (data.midiChannel === 176) {
            if (data.noteVelocityRatio === 0) {
                this.setBackgroundColor((0, config_1.getConfig)().BACKGROUND_COLOR);
            }
            else {
                this.setBackgroundColor(this.getBlendedRGB((0, config_1.getConfig)().BACKGROUND_COLOR, [0, 0, 0], 0.5));
            }
        }
    };
    RgbStrip.prototype.render = function () {
        var _this = this;
        Object.entries(this.colors).forEach(function (_a) {
            var index = _a[0], color = _a[1];
            _this.channel.array[index] = (color[0] << 16) | (color[1] << 8) | color[2];
        });
        rpi_ws281x_native_1["default"].render();
    };
    RgbStrip.prototype.RGBToHSL = function (r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var l = Math.max(r, g, b);
        var s = l - Math.min(r, g, b);
        var h = s ? (l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s) : 0;
        return [
            60 * h < 0 ? 60 * h + 360 : 60 * h,
            100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
            (100 * (2 * l - s)) / 2
        ];
    };
    RgbStrip.prototype.HSLToRGB = function (h, s, l) {
        s /= 100;
        l /= 100;
        var k = function (n) { return (n + h / 30) % 12; };
        var a = s * Math.min(l, 1 - l);
        var f = function (n) { return l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); };
        return [255 * f(0), 255 * f(8), 255 * f(4)];
    };
    RgbStrip.prototype.getBlendedRGB = function (_a, _b, ratio) {
        var c1r = _a[0], c1g = _a[1], c1b = _a[2];
        var c2r = _b[0], c2g = _b[1], c2b = _b[2];
        return [
            Math.round(c1r * ratio) + Math.round(c2r * (1 - ratio)),
            Math.round(c1g * ratio) + Math.round(c2g * (1 - ratio)),
            Math.round(c1b * ratio) + Math.round(c2b * (1 - ratio))
        ];
    };
    RgbStrip.prototype.setColor = function (index, color) {
        this.colors[index] = color;
    };
    RgbStrip.prototype.fillColors = function (color, preserveLightness) {
        var _this = this;
        if (preserveLightness === void 0) { preserveLightness = true; }
        var _a = this.RGBToHSL.apply(this, color), h = _a[0], s = _a[1], l = _a[2];
        Object.keys(this.colors).forEach(function (key) {
            var currentRGB = _this.colors[Number(key)];
            var newRGB = _this.HSLToRGB(h, s, preserveLightness ? _this.RGBToHSL.apply(_this, currentRGB)[2] : l);
            _this.setColor(Number(key), newRGB);
        });
    };
    return RgbStrip;
}());
exports.RgbStrip = RgbStrip;
