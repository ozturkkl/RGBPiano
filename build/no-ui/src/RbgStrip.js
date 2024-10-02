"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RgbStrip = void 0;
var config_1 = require("../util/config");
var colors_1 = require("../util/colors");
var RgbStrip = /** @class */ (function () {
    function RgbStrip() {
        var _this = this;
        this.ws281x = require('rpi-ws281x-native');
        this.channel = this.initializeWS281x();
        this.colors = {};
        (0, config_1.onConfigUpdated)(function (updatedProperties) {
            if (updatedProperties.BRIGHTNESS !== undefined) {
                _this.setBrightness(updatedProperties.BRIGHTNESS);
            }
            if (updatedProperties.BACKGROUND_BRIGHTNESS !== undefined ||
                updatedProperties.BACKGROUND_COLOR_RGB !== undefined) {
                _this.fillColors();
            }
            if (updatedProperties.LED_END_COUNT !== undefined) {
                _this.colors = {};
                _this.fillColors();
                _this.ws281x.finalize();
                _this.channel = _this.initializeWS281x();
            }
            if (updatedProperties.LED_START_COUNT !== undefined) {
                _this.colors = {};
                _this.fillColors();
            }
        });
        this.fillColors();
    }
    RgbStrip.prototype.initializeWS281x = function () {
        return this.ws281x((0, config_1.getConfig)().LED_END_COUNT, {
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
        this.ws281x.render();
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
    RgbStrip.prototype.handleNotePress = function (message) {
        var midiChannel = message[0];
        // note
        if (midiChannel === 144) {
            var notePositionRatio = this.getNotePositionRatio(message[1]);
            var noteVelocityRatio = (0, config_1.getConfig)().CONSTANT_VELOCITY ? 1 : message[2] / 127;
            this.noteHandler(notePositionRatio, noteVelocityRatio);
        }
        if (midiChannel === 128) {
            var notePositionRatio = this.getNotePositionRatio(message[1]);
            this.noteHandler(notePositionRatio, 0);
        }
    };
    RgbStrip.prototype.getNotePositionRatio = function (note) {
        return (0, config_1.getConfig)().LED_INVERT
            ? 1 - (note - config_1.MIN_NOTE) / (config_1.MAX_NOTE - config_1.MIN_NOTE)
            : (note - config_1.MIN_NOTE) / (config_1.MAX_NOTE - config_1.MIN_NOTE);
    };
    return RgbStrip;
}());
exports.RgbStrip = RgbStrip;
