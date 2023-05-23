"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.RgbStrip = void 0;
var rpi_ws281x_native_1 = __importDefault(require("rpi-ws281x-native"));
var config_1 = require("./config");
var colors_1 = require("./colors");
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
        this.reset();
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
        var blendedColor = (0, colors_1.getBlendedRGB)([red, green, blue], (0, config_1.getConfig)().BACKGROUND_COLOR, velocityRatio);
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
                this.setBackgroundColor((0, colors_1.getBlendedRGB)((0, config_1.getConfig)().BACKGROUND_COLOR, [0, 0, 0], 0.5));
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
    RgbStrip.prototype.setColor = function (index, color) {
        this.colors[index] = color;
    };
    RgbStrip.prototype.fillColors = function (color, preserveLightness) {
        var _this = this;
        if (preserveLightness === void 0) { preserveLightness = true; }
        var _a = colors_1.RGBToHSL.apply(void 0, color), h = _a[0], s = _a[1], l = _a[2];
        Object.keys(this.colors).forEach(function (key) {
            var currentRGB = _this.colors[Number(key)];
            var newRGB = (0, colors_1.HSLToRGB)(h, s, preserveLightness ? colors_1.RGBToHSL.apply(void 0, currentRGB)[2] : l);
            _this.setColor(Number(key), newRGB);
        });
    };
    return RgbStrip;
}());
exports.RgbStrip = RgbStrip;
