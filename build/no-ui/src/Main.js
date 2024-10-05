"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
var WebsocketP2P_1 = require("./WebsocketP2P");
var config_1 = require("../util/config");
var RbgStrip_1 = require("./RbgStrip");
var Midi_1 = require("./Midi");
var BluetoothMidi_1 = require("./BluetoothMidi");
function Main(ipcMain) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, config, connectBleDevicesInterval_1, connectBleDevices_1, e_1, rgbStrip_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connection = new WebsocketP2P_1.WebsocketP2P();
                    return [4 /*yield*/, connection.connect()];
                case 1:
                    _a.sent();
                    config = (0, config_1.getSavedConfig)();
                    (0, config_1.onConfigUpdated)(function () {
                        (0, config_1.saveConfigToFile)();
                    });
                    if (!ipcMain) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    // SETUP MIDI
                    return [4 /*yield*/, Midi_1.Midi.init()];
                case 3:
                    // SETUP MIDI
                    _a.sent();
                    console.log('Midi initialized');
                    console.log("Midi inputs:\n  ".concat(Midi_1.Midi.inputs.join('\n  ')));
                    console.log("Midi outputs:\n  ".concat(Midi_1.Midi.outputs.join('\n  ')));
                    new Midi_1.Midi((0, config_1.getConfig)().SELECTED_DEVICE, function (msg) {
                        connection.send({
                            type: 'midi',
                            data: msg
                        });
                    });
                    // SETUP CONFIG
                    connection.send({
                        type: 'config',
                        data: config
                    });
                    ipcMain.handle('config', function (_, config) {
                        (0, config_1.updateConfig)(config);
                    });
                    (0, config_1.onConfigUpdated)(function (config) {
                        connection.send({
                            type: 'config',
                            data: config
                        });
                    });
                    connectBleDevices_1 = function () {
                        var autoConnectDevices = (0, config_1.getConfig)().AUTO_CONNECT_BLE_DEVICES;
                        autoConnectDevices.forEach(function (device) {
                            var midi = new Midi_1.Midi(device.port);
                            BluetoothMidi_1.BluetoothMidi.getDevice(device.id, function (data) {
                                midi.sendMessage(data);
                            });
                        });
                        connectBleDevicesInterval_1 && clearInterval(connectBleDevicesInterval_1);
                        connectBleDevicesInterval_1 = setInterval(function () {
                            autoConnectDevices.forEach(function (device) {
                                BluetoothMidi_1.BluetoothMidi.getDevice(device.id).connect();
                            });
                        }, 1000);
                    };
                    (0, config_1.onConfigUpdated)(function () {
                        connectBleDevices_1();
                    });
                    connectBleDevices_1();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 5];
                case 5:
                    // IF NOT ELECTRON => RASPBERRY PI - LED STRIP
                    if (!ipcMain) {
                        rgbStrip_1 = new RbgStrip_1.RgbStrip();
                        connection.listen(function (message) {
                            console.log(message);
                            if ((message === null || message === void 0 ? void 0 : message.type) === 'midi') {
                                rgbStrip_1.handleNotePress(message.data);
                            }
                            if ((message === null || message === void 0 ? void 0 : message.type) === 'config') {
                                (0, config_1.updateConfig)(message.data);
                            }
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.Main = Main;
