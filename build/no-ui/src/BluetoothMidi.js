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
exports.BluetoothMidi = void 0;
var electron_1 = require("electron");
var execJsOnClient_1 = require("../util/execJsOnClient");
var BluetoothMidi = /** @class */ (function () {
    function BluetoothMidi(deviceId) {
        this.connected = false;
        BluetoothMidi.init();
        this.deviceId = deviceId;
    }
    BluetoothMidi.init = function () {
        if (BluetoothMidi.initialized)
            return;
        this.webContents = electron_1.BrowserWindow.getAllWindows()[0].webContents;
        if (!this.webContents) {
            throw new Error('No main window web contents found');
        }
        electron_1.ipcMain.handle('ble-midi-connected', function (_, deviceId) {
            var device = BluetoothMidi.getDevice(deviceId);
            device.connected = true;
            console.log('Connected to device: ', deviceId);
        });
        electron_1.ipcMain.handle('ble-midi-disconnected', function (_, deviceId) {
            var device = BluetoothMidi.getDevice(deviceId);
            device.connected = false;
            console.log('Disconnected from device: ', deviceId);
        });
        electron_1.ipcMain.handle('ble-midi-data', function (_, _a) {
            var deviceId = _a.deviceId, data = _a.data;
            var device = BluetoothMidi.getDevice(deviceId);
            var parsed = BluetoothMidi.parseMIDIData(data);
            parsed.messages.forEach(function (msg) {
                var _a;
                (_a = device.onMessage) === null || _a === void 0 ? void 0 : _a.call(device, msg.data);
            });
        });
        this.startEnumeration();
        BluetoothMidi.initialized = true;
    };
    BluetoothMidi.parseMIDIData = function (dataArray) {
        // COMMON MIDI VALUES
        // 128 - 143: Note Off
        // 144 - 159: Note On
        // 160 - 175: Polyphonic Aftertouch
        // 176 - 191: CC
        // 192 - 207: Program Change
        // 208 - 223: Channel Aftertouch
        // 224 - 239: Pitch Bend
        // COMMON CC VALUES
        // 0: Bank Select
        // 1: Modulation Wheel
        // 2: Breath Controller
        // 7: Volume
        // 10: Pan
        // 11: Expression Controller
        // 64: Sustain
        // 65: Portamento
        // 66: Sostenuto
        // 67: Soft Pedal
        // 120: All Sound Off
        // 121: Reset All Controllers
        // 123: All Notes Off
        var MST = dataArray[0]; // most significant time byte
        var errorParsing = false;
        var messages = [];
        for (var i = 1; i < dataArray.length; i++) {
            var message = {
                time: 0,
                data: [],
            };
            var LST = dataArray[i]; // least significant time byte
            message.time = (MST << 8) + LST;
            var status_1 = dataArray[i + 1];
            if (status_1 < 128 || status_1 > 239) {
                errorParsing = true;
                break;
            }
            if (status_1 >= 128 && status_1 <= 143) {
                // Note Off
                message.data = [status_1, dataArray[i + 2], dataArray[i + 3]];
                // sometimes the note off message is sent twice, check for that condition
                if (dataArray[i + 4] < 128 && dataArray[i + 5] < 128) {
                    // next two bytes are not a valid status or time byte, they are likely a combined note off message
                    message.data = [status_1, dataArray[i + 4], dataArray[i + 5]];
                    i += 2;
                }
                i += 3;
            }
            else if (status_1 >= 144 && status_1 <= 159) {
                // Note On
                message.data = [status_1, dataArray[i + 2], dataArray[i + 3]];
                i += 3;
            }
            else if (status_1 >= 160 && status_1 <= 175) {
                // Polyphonic Aftertouch
                message.data = [status_1, dataArray[i + 2], dataArray[i + 3]];
                i += 3;
            }
            else if (status_1 >= 176 && status_1 <= 191) {
                // CC
                message.data = [status_1, dataArray[i + 2], dataArray[i + 3]];
                i += 3;
            }
            else if (status_1 >= 192 && status_1 <= 207) {
                // Program Change
                message.data = [status_1, dataArray[i + 2]];
                i += 2;
            }
            else if (status_1 >= 208 && status_1 <= 223) {
                // Channel Aftertouch
                message.data = [status_1, dataArray[i + 2]];
                i += 2;
            }
            else if (status_1 >= 224 && status_1 <= 239) {
                // Pitch Bend
                message.data = [status_1, dataArray[i + 2], dataArray[i + 3]];
                // sometimes the pitch bend message is sent twice, check for that condition
                if (dataArray[i + 4] < 128 && dataArray[i + 5] < 128) {
                    // next two bytes are not a valid status or time byte, they are likely a combined pitch bend message
                    message.data = [status_1, dataArray[i + 4], dataArray[i + 5]];
                    i += 2;
                }
                i += 3;
            }
            messages.push(message);
        }
        if (errorParsing) {
            console.error('Error parsing MIDI data: ', dataArray);
        }
        return {
            messages: messages,
            errorParsing: errorParsing,
        };
    };
    BluetoothMidi.startEnumeration = function () {
        var _this = this;
        console.log('Enumerating Ble MIDI devices...');
        var requestDeviceClient = function () {
            (0, execJsOnClient_1.execJsOnClient)(function () {
                window.navigator.bluetooth
                    .requestDevice({
                    filters: [{ services: ['03b80e5a-ede8-4b33-a751-6ce34ec4c700'] }],
                })
                    .catch(function () {
                    // noop
                });
            });
        };
        setInterval(requestDeviceClient, 20000);
        requestDeviceClient();
        this.webContents.on('select-bluetooth-device', function (event, deviceList) {
            event.preventDefault();
            var prevMidiDevices = new Map(JSON.parse(JSON.stringify(Array.from(_this.midiDevices))));
            for (var _i = 0, deviceList_1 = deviceList; _i < deviceList_1.length; _i++) {
                var device = deviceList_1[_i];
                _this.midiDevices.set(device.deviceId, {
                    name: device.deviceName,
                });
            }
            var diffHappened = JSON.stringify(Array.from(_this.midiDevices)) !== JSON.stringify(Array.from(prevMidiDevices));
            if (diffHappened) {
                _this.deviceListUpdateSubscribers.forEach(function (handler) { return handler(_this.midiDevices); });
            }
        });
    };
    Object.defineProperty(BluetoothMidi, "devices", {
        get: function () {
            BluetoothMidi.init();
            return this.midiDevices;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BluetoothMidi, "onMidiDeviceListUpdated", {
        set: function (handler) {
            BluetoothMidi.init();
            this.deviceListUpdateSubscribers.push(handler);
        },
        enumerable: false,
        configurable: true
    });
    BluetoothMidi.getDevice = function (deviceId, onMessage, connect) {
        if (connect === void 0) { connect = false; }
        var device = BluetoothMidi.deviceMap.get(deviceId);
        if (!device) {
            device = new BluetoothMidi(deviceId);
            BluetoothMidi.deviceMap.set(deviceId, device);
        }
        if (onMessage) {
            device.onMessage = onMessage;
        }
        if (connect)
            device.connect();
        return device;
    };
    BluetoothMidi.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connectHandlerFunc, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!BluetoothMidi.devices.has(this.deviceId) || this.connected || BluetoothMidi.connectionInProgress)
                            return [2 /*return*/];
                        BluetoothMidi.connectionInProgress = true;
                        console.log('Connecting to device: ', this.deviceId);
                        connectHandlerFunc = function (event, deviceList, callback) {
                            event.preventDefault();
                            var device = deviceList.find(function (d) { return d.deviceId === _this.deviceId; });
                            if (device) {
                                console.log("Connecting bluetooth midi device: ".concat(_this.deviceId, "..."));
                                callback(device.deviceId);
                                BluetoothMidi.webContents.off('select-bluetooth-device', connectHandlerFunc);
                            }
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        BluetoothMidi.webContents.on('select-bluetooth-device', connectHandlerFunc);
                        return [4 /*yield*/, (0, execJsOnClient_1.execJsOnClient)(function (deviceId) { return __awaiter(_this, void 0, void 0, function () {
                                var device, server, service, characteristic;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, window.navigator.bluetooth.requestDevice({
                                                filters: [{ services: ['03b80e5a-ede8-4b33-a751-6ce34ec4c700'] }],
                                            })];
                                        case 1:
                                            device = _a.sent();
                                            return [4 /*yield*/, device.gatt.connect()];
                                        case 2:
                                            server = _a.sent();
                                            return [4 /*yield*/, server.getPrimaryService('03b80e5a-ede8-4b33-a751-6ce34ec4c700')];
                                        case 3:
                                            service = _a.sent();
                                            return [4 /*yield*/, service.getCharacteristic('7772e5db-3868-4112-a1a9-f2669d106bf3')];
                                        case 4:
                                            characteristic = _a.sent();
                                            return [4 /*yield*/, characteristic.startNotifications()];
                                        case 5:
                                            _a.sent();
                                            window.ipcRenderer.invoke('ble-midi-connected', deviceId);
                                            device.addEventListener('gattserverdisconnected', function () {
                                                window.ipcRenderer.invoke('ble-midi-disconnected', deviceId);
                                            });
                                            characteristic.addEventListener('characteristicvaluechanged', function (event) {
                                                var data = new Uint8Array(event.target.value.buffer);
                                                window.ipcRenderer.invoke('ble-midi-data', {
                                                    deviceId: deviceId,
                                                    data: data,
                                                });
                                            });
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, this.deviceId)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Could not connect to device: ', this.deviceId);
                        return [3 /*break*/, 5];
                    case 4:
                        BluetoothMidi.webContents.off('select-bluetooth-device', connectHandlerFunc);
                        BluetoothMidi.connectionInProgress = false;
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // STATIC MEMBERS
    BluetoothMidi.midiDevices = new Map();
    BluetoothMidi.initialized = false;
    BluetoothMidi.deviceListUpdateSubscribers = [];
    BluetoothMidi.connectionInProgress = false;
    BluetoothMidi.deviceMap = new Map();
    return BluetoothMidi;
}());
exports.BluetoothMidi = BluetoothMidi;
