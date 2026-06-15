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
exports.BluetoothManager = void 0;
var electron_1 = require("electron");
var execJsOnClient_1 = require("../util/execJsOnClient");
var BluetoothManager = /** @class */ (function () {
    function BluetoothManager() {
        this.midiServiceUUID = '03b80e5a-ede8-4b33-a751-6ce34ec4c700';
        this.midiCharacteristicUUID = '7772e5db-3868-4112-a1a9-f2669d106bf3';
        this.midiDevices = new Map();
        if (BluetoothManager.singleton) {
            return BluetoothManager.singleton;
        }
        BluetoothManager.singleton = this;
        this.mainWindow = electron_1.BrowserWindow.getAllWindows()[0];
        if (!this.mainWindow) {
            throw new Error('No main window found');
        }
        this.enumerateMidiDevices();
    }
    Object.defineProperty(BluetoothManager.prototype, "devices", {
        get: function () {
            return this.midiDevices;
        },
        enumerable: false,
        configurable: true
    });
    // private async connectToDevice(deviceId?: string) {
    //   if (this.midiDevices.size === 0) {
    //     throw new Error('No MIDI devices found')
    //   }
    //   if (!deviceId) {
    //     deviceId = this.midiDevices.keys().next().value
    //   }
    //   const device = await window.navigator.bluetooth.requestDevice({
    //     filters: [{ services: [this.midiServiceUUID] }],
    //     optionalServices: [this.midiServiceUUID]
    //   })
    // }
    BluetoothManager.prototype.enumerateMidiDevices = function () {
        var _this = this;
        console.log('Enumerating MIDI devices...');
        setInterval(function () {
            (0, execJsOnClient_1.execJsOnClient)(function () {
                window.navigator.bluetooth.requestDevice({
                    filters: [{ services: ['${this.midiServiceUUID}'] }]
                });
            });
        }, 20000);
        this.mainWindow.webContents.on('select-bluetooth-device', function (event, deviceList) {
            event.preventDefault();
            for (var _i = 0, deviceList_1 = deviceList; _i < deviceList_1.length; _i++) {
                var device = deviceList_1[_i];
                _this.midiDevices.set(device.deviceId, device.deviceName);
            }
        });
    };
    BluetoothManager.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // window.electron.ipcRenderer.on('bluetooth-device-list', (event, data) => {
                    //   console.log('Bluetooth devices:', data)
                    // })
                    // const device = await navigator.bluetooth.requestDevice({
                    //   filters: [{ services: ['03b80e5a-ede8-4b33-a751-6ce34ec4c700'] }]
                    // })
                    // const server = await device.gatt.connect()
                    // console.log('Connected to GATT Server:', server)
                    // const service = await server.getPrimaryService('03b80e5a-ede8-4b33-a751-6ce34ec4c700')
                    // const characteristic = await service.getCharacteristic('7772e5db-3868-4112-a1a9-f2669d106bf3')
                    // const deviceID = device.id
                    // const deviceName = device.name
                    // await characteristic.startNotifications()
                    // characteristic.addEventListener('characteristicvaluechanged', (event) => {
                    //   const value = event.target.value
                    //   const data = new Uint8Array(value.buffer)
                    //   window.electron.ipcRenderer.send('bluetooth-data', {
                    //     id: deviceID,
                    //     data
                    //   })
                    // })
                    // window.electron.ipcRenderer.send('bluetooth-connect', {
                    //   id: deviceID,
                    //   name: deviceName
                    // })
                    // // send event back on disconnect
                    // device.addEventListener('gattserverdisconnected', () => {
                    //   window.electron.ipcRenderer.send('bluetooth-disconnect', {
                    //     id: deviceID
                    //   })
                    // })
                }
                catch (error) {
                    // if (error.name === 'NotFoundError') return
                    console.error('Error connecting to Bluetooth device:', error);
                }
                finally {
                    console.log('Bluetooth connection attempt complete');
                }
                return [2 /*return*/];
            });
        });
    };
    return BluetoothManager;
}());
exports.BluetoothManager = BluetoothManager;
