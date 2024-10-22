"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
exports.Main = Main;
var WebsocketP2P_1 = require("./WebsocketP2P");
var config_1 = require("../util/config");
var RbgStrip_1 = require("./RbgStrip");
var Midi_1 = require("./Midi");
function Main(electron) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, ledReceiveFrom_1, BluetoothMidi_1, connectBleDevicesInterval_1, connectBleDevices_1, e_1, rgbStrip_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, config_1.getSavedConfig)(electron === null || electron === void 0 ? void 0 : electron.app);
                    (0, config_1.onConfigUpdated)(function (c) { return (0, config_1.saveConfigToFile)(electron === null || electron === void 0 ? void 0 : electron.app, c); });
                    connection = new WebsocketP2P_1.WebsocketP2P();
                    connection.connect();
                    if (!electron) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // SETUP IPC LISTENERS
                    electron.ipcMain.handle('config', function (_, config) { return (0, config_1.updateConfig)(config); });
                    electron.ipcMain.handle('connected', function () { return connection.isConnected; });
                    electron.ipcMain.handle('window:minimize', function () { var _a; return (_a = electron.BrowserWindow.getFocusedWindow()) === null || _a === void 0 ? void 0 : _a.minimize(); });
                    electron.ipcMain.handle('window:maximize', function () {
                        var win = electron.BrowserWindow.getFocusedWindow();
                        (win === null || win === void 0 ? void 0 : win.isMaximized()) ? win === null || win === void 0 ? void 0 : win.unmaximize() : win === null || win === void 0 ? void 0 : win.maximize();
                    });
                    electron.ipcMain.handle('window:close', function () { var _a, _b; return (_b = (_a = electron === null || electron === void 0 ? void 0 : electron.BrowserWindow) === null || _a === void 0 ? void 0 : _a.getFocusedWindow()) === null || _b === void 0 ? void 0 : _b.close(); });
                    // SETUP MIDI
                    return [4 /*yield*/, Midi_1.Midi.init()];
                case 2:
                    // SETUP MIDI
                    _a.sent();
                    console.log('Midi initialized');
                    console.log("Inputs:\n  ".concat(Midi_1.Midi.inputs.join('\n  ')));
                    console.log("Outputs:\n  ".concat(Midi_1.Midi.outputs.join('\n  ')));
                    electron.ipcMain.handle('midi:get-devices', function () { return ({ inputs: Midi_1.Midi.inputs, outputs: Midi_1.Midi.outputs }); });
                    Midi_1.Midi.onStateChanged(function () {
                        return electron.ipcMain.emit('midi:devices-changed', {
                            inputs: Midi_1.Midi.inputs,
                            outputs: Midi_1.Midi.outputs,
                        });
                    });
                    (0, config_1.onConfigUpdated)(function (config) {
                        if (config.LED_RECEIVE_FROM) {
                            ledReceiveFrom_1 === null || ledReceiveFrom_1 === void 0 ? void 0 : ledReceiveFrom_1.onMessage(undefined);
                            ledReceiveFrom_1 = new Midi_1.Midi(config.LED_RECEIVE_FROM);
                            ledReceiveFrom_1.onMessage(function (msg) {
                                connection.send({
                                    type: 'midi',
                                    data: msg,
                                });
                            });
                        }
                    }, true);
                    // SETUP CONFIG
                    connection.onConnectionEstablished = function () {
                        connection.send({
                            type: 'config',
                            data: (0, config_1.getConfig)(),
                        });
                    };
                    (0, config_1.onConfigUpdated)(function (config) {
                        connection.send({
                            type: 'config',
                            data: config,
                        });
                    });
                    return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./BluetoothMidi')); })];
                case 3:
                    BluetoothMidi_1 = (_a.sent()).BluetoothMidi;
                    connectBleDevices_1 = function () {
                        var autoConnectDevices = (0, config_1.getConfig)().AUTO_CONNECT_BLE_DEVICES;
                        autoConnectDevices.forEach(function (device) {
                            var midi = new Midi_1.Midi(device.port);
                            BluetoothMidi_1.getDevice(device.id, function (data) {
                                midi.sendMessage(data);
                            });
                        });
                        connectBleDevicesInterval_1 && clearInterval(connectBleDevicesInterval_1);
                        connectBleDevicesInterval_1 = setInterval(function () {
                            autoConnectDevices.forEach(function (device) {
                                BluetoothMidi_1.getDevice(device.id).connect();
                            });
                        }, 1000);
                    };
                    (0, config_1.onConfigUpdated)(function (config) {
                        if (config.AUTO_CONNECT_BLE_DEVICES)
                            connectBleDevices_1();
                    });
                    connectBleDevices_1();
                    // DEBUG LISTENER
                    connection.listen(function (message) {
                        message.type !== 'ping' && console.log(message);
                    });
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 5];
                case 5:
                    // IF NOT ELECTRON => RASPBERRY PI - LED STRIP
                    if (!(electron === null || electron === void 0 ? void 0 : electron.ipcMain)) {
                        rgbStrip_1 = new RbgStrip_1.RgbStrip();
                        connection.listen(function (message) {
                            message.type !== 'ping' && console.log(message);
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
