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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.mainProcess = void 0;
var websocket_1 = require("./websocket");
var rbgStrip_1 = require("./rbgStrip");
var midi_1 = require("./midi");
var BACKGROUND_COLOR = [0, 2, 2];
var COLOR = [0, 255, 255];
function mainProcess() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, midi, devices, rgbStrip;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connection = new websocket_1.Connection();
                    return [4 /*yield*/, connection.connect()];
                case 1:
                    _a.sent();
                    midi = new midi_1.Midi(connection);
                    devices = midi.getDevices();
                    devices.forEach(function (device) {
                        if (device.includes('Springbeats vMIDI1')) {
                            midi.openInput(device);
                        }
                    });
                    rgbStrip = new rbgStrip_1.RgbStrip();
                    rgbStrip.setBrightness(255);
                    rgbStrip.setBackgroundColor.apply(rgbStrip, BACKGROUND_COLOR);
                    connection.listen(function (message) {
                        console.log(message);
                        if ((message === null || message === void 0 ? void 0 : message.type) === 'midi' && (message === null || message === void 0 ? void 0 : message.data)) {
                            var _a = message.data, notePositionRatio = _a.notePositionRatio, noteVelocityRatio = _a.noteVelocityRatio, midiChannel = _a.midiChannel;
                            // note
                            if (midiChannel === 144) {
                                rgbStrip.setPixelColor.apply(rgbStrip, __spreadArray([notePositionRatio, noteVelocityRatio === 0 ? 0 : 1], COLOR, false));
                            }
                            // pedal
                            if (midiChannel === 176) {
                                // disabled until other notes disappearing is fixed
                                // rgbStrip.setBackgroundColor(
                                //   ...BACKGROUND_COLOR.map((c) => c * (noteVelocityRatio === 1 ? 2 : 1))
                                // );
                            }
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.mainProcess = mainProcess;
