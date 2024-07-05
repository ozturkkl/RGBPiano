"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.Midi = void 0;
var midi_1 = __importDefault(require("midi"));
var config_1 = require("./config");
var Midi = /** @class */ (function () {
    function Midi(connection, rgbStrip) {
        this.minNote = config_1.MIN_NOTE;
        this.maxNote = config_1.MAX_NOTE;
        this.input = new midi_1["default"].Input();
        this.output = new midi_1["default"].Output();
        this.connection = connection;
        this.rgbStrip = rgbStrip;
        this.invertPosition = (0, config_1.getConfig)().LED_INVERT;
        this.listenToInput();
        this.initConfiguredInput();
    }
    Midi.prototype.getDevices = function () {
        var devices = [];
        for (var i = 0; i < this.input.getPortCount(); i++) {
            devices.push(this.input.getPortName(i));
        }
        return devices;
    };
    Midi.prototype.openInput = function (device) {
        var _this = this;
        this.getDevices().forEach(function (d, i) {
            if (d === device) {
                try {
                    _this.input.closePort();
                    _this.input.openPort(i);
                    console.log("Opened port ".concat(d));
                }
                catch (e) {
                    console.error("Failed to open port ".concat(d, ": ").concat(e));
                }
            }
        });
    };
    Midi.prototype.listenToInput = function () {
        var _this = this;
        this.input.on('message', function (deltaTime, message) {
            var payload = {
                deltaTime: deltaTime,
                notePositionRatio: _this.invertPosition
                    ? 1 - (message[1] - _this.minNote) / (_this.maxNote - _this.minNote)
                    : (message[1] - _this.minNote) / (_this.maxNote - _this.minNote),
                noteVelocityRatio: message[2] / 127,
                midiChannel: message[0]
            };
            _this.connection.send({
                type: 'midi',
                data: payload
            });
            _this.rgbStrip.handleNotePress(payload);
        });
    };
    Midi.prototype.initConfiguredInput = function () {
        var _this = this;
        var devices = this.getDevices();
        devices.forEach(function (device) {
            if (device.includes((0, config_1.getConfig)().SELECTED_DEVICE)) {
                _this.openInput(device);
            }
        });
        (0, config_1.onConfigUpdated)(function (config) {
            if (config.SELECTED_DEVICE) {
                _this.openInput(config.SELECTED_DEVICE);
            }
            if (config.LED_INVERT) {
                _this.invertPosition = config.LED_INVERT;
            }
        });
    };
    return Midi;
}());
exports.Midi = Midi;
