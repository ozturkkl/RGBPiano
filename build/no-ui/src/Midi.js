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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Midi = void 0;
var config_1 = require("../util/config");
var jzz_1 = __importDefault(require("jzz"));
var Midi = /** @class */ (function () {
    function Midi(deviceName, onMessage) {
        var _this = this;
        this._inputActive = false;
        if (!Midi._initialized) {
            throw new Error('Midi not initialized, call Midi.init() first');
        }
        this._deviceName = deviceName;
        this._onMessage = onMessage;
        if (this._deviceName === undefined) {
            throw new Error('No midi device name provided when creating midi input/output!');
        }
        if (this._onMessage) {
            setInterval(function () {
                _this.listenToInputIfNeeded();
            }, 1000);
        }
    }
    Object.defineProperty(Midi.prototype, "deviceName", {
        get: function () {
            return this._deviceName;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Midi.prototype, "online", {
        get: function () {
            return this._inputActive;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Midi, "inputs", {
        get: function () {
            return this._inputs;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Midi, "outputs", {
        get: function () {
            return this._outputs;
        },
        enumerable: false,
        configurable: true
    });
    Midi.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this._initialized)
                            return [2 /*return*/];
                        if (!(this._jzz === undefined)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, jzz_1.default.requestMIDIAccess()];
                    case 1:
                        _a._jzz = _b.sent();
                        _b.label = 2;
                    case 2:
                        this._jzz.onstatechange = function () {
                            _this.populateDevices();
                        };
                        return [4 /*yield*/, this.populateDevices()];
                    case 3:
                        _b.sent();
                        this._initialized = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    Midi.prototype.sendMessage = function (message) {
        var output = Midi._jzz.outputs.get(this._deviceName);
        if (!output) {
            console.error("Could not find output device with name ".concat(this._deviceName));
            return;
        }
        try {
            output.send(message);
        }
        catch (e) {
            console.error(e);
        }
    };
    Midi.prototype.listenToInputIfNeeded = function () {
        var _this = this;
        if (this._inputActive)
            return;
        var selectedDevice = Midi._jzz.inputs.get(this._deviceName);
        if (!selectedDevice)
            return;
        this._inputActive = true;
        var inputDeviceRefreshTimeout;
        var ito = function () {
            if (inputDeviceRefreshTimeout)
                clearTimeout(inputDeviceRefreshTimeout);
            inputDeviceRefreshTimeout = setTimeout(function () {
                _this._inputActive = false;
            }, config_1.INPUT_DEVICE_REFRESH_INTERVAL);
        };
        ito();
        selectedDevice.onmidimessage = function (msg) {
            var _a;
            ito();
            (_a = _this._onMessage) === null || _a === void 0 ? void 0 : _a.call(_this, Array.from(msg.data));
        };
    };
    Midi.populateDevices = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._inputs = Array.from(this._jzz.inputs.values()).map(function (i) { var _a; return (_a = i.name) !== null && _a !== void 0 ? _a : 'Unknown'; });
                this._outputs = Array.from(this._jzz.outputs.values()).map(function (o) { var _a; return (_a = o.name) !== null && _a !== void 0 ? _a : 'Unknown'; });
                return [2 /*return*/];
            });
        });
    };
    Midi._inputs = [];
    Midi._outputs = [];
    Midi._initialized = false;
    return Midi;
}());
exports.Midi = Midi;
