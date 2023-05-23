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
                _this.fillColors(updatedProperties.BACKGROUND_COLOR);
            }
        });
        this.fillColors((0, config_1.getConfig)().BACKGROUND_COLOR);
    }
    RgbStrip.prototype.setBrightness = function (brightness) {
        this.channel.brightness = brightness * 255;
        this.render();
    };
    RgbStrip.prototype.setColor = function (index, color, preserveLightness) {
        if (preserveLightness === void 0) { preserveLightness = false; }
        if (preserveLightness) {
            var targetHSL = colors_1.RGBToHSL.apply(void 0, color);
            var currentHSL = colors_1.RGBToHSL.apply(void 0, this.colors[index]);
            this.colors[index] = (0, colors_1.HSLToRGB)(targetHSL[0], targetHSL[1], currentHSL[2]);
        }
        else {
            this.colors[index] = color;
        }
    };
    RgbStrip.prototype.fillColors = function (color, preserveLightness) {
        var _this = this;
        if (color === void 0) { color = (0, config_1.getConfig)().BACKGROUND_COLOR; }
        if (preserveLightness === void 0) { preserveLightness = false; }
        Object.keys(this.colors).forEach(function (key) {
            _this.setColor(Number(key), color, preserveLightness);
        });
        this.render();
    };
    RgbStrip.prototype.render = function () {
        var _this = this;
        Object.entries(this.colors).forEach(function (_a) {
            var index = _a[0], color = _a[1];
            _this.channel.array[index] = (color[0] << 16) | (color[1] << 8) | color[2];
        });
        rpi_ws281x_native_1["default"].render();
    };
    RgbStrip.prototype.noteHandler = function (positionRatio, velocityRatio, _a) {
        if (velocityRatio === void 0) { velocityRatio = 1; }
        var _b = _a === void 0 ? (0, config_1.getConfig)().COLOR : _a, red = _b[0], green = _b[1], blue = _b[2];
        var blendedColor = (0, colors_1.getBlendedRGB)([red, green, blue], (0, config_1.getConfig)().BACKGROUND_COLOR, velocityRatio);
        var colorPosition = Math.floor(positionRatio * config_1.NUM_LEDS);
        this.setColor(colorPosition, blendedColor);
        this.render();
    };
    RgbStrip.prototype.handleNotePress = function (data) {
        // note
        if (data.midiChannel === 144) {
            if ((0, config_1.getConfig)().CONSTANT_VELOCITY) {
                data.noteVelocityRatio = data.noteVelocityRatio === 0 ? 0 : 1;
            }
            this.noteHandler(data.notePositionRatio, data.noteVelocityRatio);
        }
        // pedal
        if (data.midiChannel === 176) {
            if (data.noteVelocityRatio === 0) {
                this.fillColors((0, config_1.getConfig)().BACKGROUND_COLOR, true);
            }
            else {
                this.fillColors((0, colors_1.getBlendedRGB)((0, config_1.getConfig)().BACKGROUND_COLOR, [0, 0, 0], 0.5), true);
            }
        }
    };
    return RgbStrip;
}());
exports.RgbStrip = RgbStrip;
