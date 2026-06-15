"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MidiDevice = void 0;
var midi_1 = __importDefault(require("midi"));
var config_1 = require("../util/config");
var MidiDevice = /** @class */ (function () {
    function MidiDevice(deviceName, onMessage) {
        this.outputConnected = false;
        this.deviceName = deviceName;
        this.onMessage = onMessage;
        this.input = new midi_1.default.Input();
        this.output = new midi_1.default.Output();
        if (this.onMessage) {
            if (this.deviceName === undefined) {
                console.error('No midi device name provided for listening virtual midi device');
                return;
            }
            this.listenToInput();
            this.connectToInput();
        }
    }
    MidiDevice.getDevices = function () {
        // refactor with jzz
        var inputDevices = [];
        var id = new midi_1.default.Input();
        for (var i = 0; i < id.getPortCount(); i++) {
            inputDevices.push(id.getPortName(i));
        }
        var outputDevices = [];
        var od = new midi_1.default.Output();
        for (var i = 0; i < od.getPortCount(); i++) {
            outputDevices.push(od.getPortName(i));
        }
        return {
            inputDevices: inputDevices,
            outputDevices: outputDevices
        };
    };
    MidiDevice.prototype.connectToInput = function () {
        var _this = this;
        var devices = MidiDevice.getDevices().inputDevices;
        var portIndex = devices.findIndex(function (d) { return d === _this.deviceName || d.includes(_this.deviceName); });
        if (portIndex === -1) {
            console.error("Could not connect to ".concat(this.deviceName, ", retrying in 10 seconds"));
            return;
        }
        try {
            var d = devices[portIndex];
            this.input.closePort();
            this.input.openPort(portIndex);
            console.log("Listening to device ".concat(d));
        }
        catch (e) {
            console.error("Could not connect to device ".concat(this.deviceName, ": ").concat(e));
        }
    };
    MidiDevice.prototype.listenToInput = function () {
        var _this = this;
        var lastMessageTime = Date.now();
        this.input.on('message', function (_deltaTime, message) {
            var _a;
            lastMessageTime = Date.now();
            (_a = _this.onMessage) === null || _a === void 0 ? void 0 : _a.call(_this, message);
        });
        setInterval(function () {
            if (Date.now() - lastMessageTime > config_1.INPUT_DEVICE_REFRESH_INTERVAL) {
                _this.connectToInput();
                lastMessageTime = Date.now();
            }
        }, 5000);
    };
    MidiDevice.prototype.sendMessage = function (message) {
        var _this = this;
        if (!this.deviceName) {
            console.error('No midi device name provided for sending virtual midi device message!');
            return;
        }
        if (!this.outputConnected) {
            var devices = MidiDevice.getDevices().outputDevices;
            var portIndex = devices.findIndex(function (d) { return d === _this.deviceName || d.includes(_this.deviceName); });
            if (portIndex === -1) {
                console.error("Could not send message, ".concat(this.deviceName, " not found."));
                return;
            }
            this.output.closePort();
            this.output.openPort(portIndex);
            this.outputConnected = true;
        }
        try {
            this.output.sendMessage(message);
        }
        catch (e) {
            this.outputConnected = false;
            console.error("Could not send message: ".concat(e, ". Next message will try to reconnect."));
        }
    };
    return MidiDevice;
}());
exports.MidiDevice = MidiDevice;
