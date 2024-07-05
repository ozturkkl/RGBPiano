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
        this.channel = this.initializeWS281x();
        this.colors = {};
        (0, config_1.onConfigUpdated)(function (updatedProperties) {
            if (updatedProperties.BRIGHTNESS) {
                _this.setBrightness(updatedProperties.BRIGHTNESS);
            }
            if (updatedProperties.BACKGROUND_BRIGHTNESS || updatedProperties.BACKGROUND_COLOR_RGB) {
                _this.fillColors();
            }
            if (updatedProperties.LED_END_COUNT) {
                rpi_ws281x_native_1["default"].finalize();
                _this.channel = _this.initializeWS281x();
            }
            if (updatedProperties.LED_START_COUNT) {
                _this.fillColors();
            }
        });
        this.fillColors();
    }
    RgbStrip.prototype.initializeWS281x = function () {
        return (0, rpi_ws281x_native_1["default"])((0, config_1.getConfig)().LED_END_COUNT, {
            gpio: config_1.DATA_PIN,
            brightness: (0, config_1.getConfig)().BRIGHTNESS * 255
        });
    };
    RgbStrip.prototype.setBrightness = function (brightness) {
        this.channel.brightness = brightness * 255;
        this.render();
    };
    RgbStrip.prototype.setColor = function (index, color) {
        this.colors[index] = color;
    };
    RgbStrip.prototype.fillColors = function (color) {
        if (color === void 0) { color = (0, config_1.getConfig)().BACKGROUND_COLOR_RGB.map(function (c) { return c * (0, config_1.getConfig)().BACKGROUND_BRIGHTNESS; }); }
        for (var i = (0, config_1.getConfig)().LED_START_COUNT; i < (0, config_1.getConfig)().LED_END_COUNT; i++) {
            this.setColor(i, color);
        }
        this.render();
    };
    RgbStrip.prototype.render = function () {
        var _this = this;
        this.channel.array.fill(0);
        Object.entries(this.colors).forEach(function (_a) {
            var index = _a[0], color = _a[1];
            _this.channel.array[index] = (color[0] << 16) | (color[1] << 8) | color[2];
        });
        rpi_ws281x_native_1["default"].render();
    };
    RgbStrip.prototype.noteHandler = function (positionRatio, velocityRatio, _a) {
        if (velocityRatio === void 0) { velocityRatio = 1; }
        var _b = _a === void 0 ? (0, config_1.getConfig)().NOTE_PRESS_COLOR_RGB : _a, red = _b[0], green = _b[1], blue = _b[2];
        var blendedColor = (0, colors_1.getBlendedRGB)([red, green, blue], (0, config_1.getConfig)().BACKGROUND_COLOR_RGB.map(function (c) { return c * (0, config_1.getConfig)().BACKGROUND_BRIGHTNESS; }), velocityRatio);
        var colorPosition = positionRatio === 1
            ? (0, config_1.getConfig)().LED_END_COUNT - 1
            : Math.floor(positionRatio * ((0, config_1.getConfig)().LED_END_COUNT - (0, config_1.getConfig)().LED_START_COUNT) +
                (0, config_1.getConfig)().LED_START_COUNT);
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
        if (data.midiChannel === 128) {
            this.noteHandler(data.notePositionRatio, 0);
        }
        // pedal
        // if (data.midiChannel === 176) {
        //   if (data.noteVelocityRatio === 0) {
        //     this.fillColors(getConfig().BACKGROUND_COLOR, true)
        //   } else {
        //     this.fillColors(getBlendedRGB(getConfig().BACKGROUND_COLOR, [0, 0, 0], 0.5), true)
        //   }
        // }
    };
    return RgbStrip;
}());
exports.RgbStrip = RgbStrip;
