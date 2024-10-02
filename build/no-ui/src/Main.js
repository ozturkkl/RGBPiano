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
exports.Main = void 0;
var WebsocketP2P_1 = require("./WebsocketP2P");
var config_1 = require("../util/config");
var RbgStrip_1 = require("./RbgStrip");
var jzz_1 = __importDefault(require("jzz"));
// import { BluetoothManager } from './BluetoothManager'
// import { MidiDevice } from './MidiDevice'
// interface MidiMessage {
//   time: number
//   data: number[]
// }
function Main(isElectron) {
    return __awaiter(this, void 0, void 0, function () {
        var connection, rgbStrip, jzz, selectedDevice, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connection = new WebsocketP2P_1.WebsocketP2P();
                    return [4 /*yield*/, connection.connect()];
                case 1:
                    _a.sent();
                    rgbStrip = null;
                    if (!isElectron) {
                        // lazy load the RGB strip for non-electron environments like the Raspberry Pi
                        rgbStrip = new RbgStrip_1.RgbStrip();
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, jzz_1.default.requestMIDIAccess()];
                case 3:
                    jzz = _a.sent();
                    console.log('MIDI Inputs:');
                    jzz.inputs.forEach(function (input) {
                        console.log(input.name);
                    });
                    console.log('MIDI Outputs:');
                    jzz.outputs.forEach(function (output) {
                        console.log(output.name);
                    });
                    jzz.onstatechange = function (e) {
                        console.log(e.port.name, e.port.state);
                    };
                    selectedDevice = jzz.inputs.get((0, config_1.getConfig)().SELECTED_DEVICE);
                    if (selectedDevice) {
                        selectedDevice.onmidimessage = function (msg) {
                            connection.send({
                                type: 'midi',
                                data: Array.from(msg.data)
                            });
                            rgbStrip === null || rgbStrip === void 0 ? void 0 : rgbStrip.handleNotePress(Array.from(msg.data));
                        };
                    }
                    if (isElectron) {
                        // const bm = new BluetoothManager()
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [3 /*break*/, 5];
                case 5:
                    connection.listen(function (message) {
                        console.log(message);
                        if ((message === null || message === void 0 ? void 0 : message.type) === 'midi') {
                            rgbStrip === null || rgbStrip === void 0 ? void 0 : rgbStrip.handleNotePress(message.data);
                        }
                        if ((message === null || message === void 0 ? void 0 : message.type) === 'config') {
                            (0, config_1.updateConfig)(message.data);
                        }
                    });
                    return [2 /*return*/, {
                            connection: connection
                        }];
            }
        });
    });
}
exports.Main = Main;
// function parseMIDIData(dataArray: Uint8Array) {
//   // COMMON MIDI VALUES
//   // 128 - 143: Note Off
//   // 144 - 159: Note On
//   // 160 - 175: Polyphonic Aftertouch
//   // 176 - 191: CC
//   // 192 - 207: Program Change
//   // 208 - 223: Channel Aftertouch
//   // 224 - 239: Pitch Bend
//   // COMMON CC VALUES
//   // 0: Bank Select
//   // 1: Modulation Wheel
//   // 2: Breath Controller
//   // 7: Volume
//   // 10: Pan
//   // 11: Expression Controller
//   // 64: Sustain
//   // 65: Portamento
//   // 66: Sostenuto
//   // 67: Soft Pedal
//   // 120: All Sound Off
//   // 121: Reset All Controllers
//   // 123: All Notes Off
//   const MST = dataArray[0] // most significant time byte
//   let errorParsing = false
//   const messages: MidiMessage[] = []
//   const message: MidiMessage = {
//     time: 0,
//     data: []
//   }
//   for (let i = 1; i < dataArray.length; i++) {
//     const LST = dataArray[i] // least significant time byte
//     message.time = (MST << 8) + LST
//     const status = dataArray[i + 1]
//     if (status < 128 || status > 239) {
//       errorParsing = true
//       break
//     }
//     if (status >= 128 && status <= 143) {
//       // Note Off
//       message.data = [status, dataArray[i + 2], dataArray[i + 3]]
//       // sometimes the note off message is sent twice, check for that condition
//       if (dataArray[i + 4] < 128 && dataArray[i + 5] < 128) {
//         // next two bytes are not a valid status or time byte, they are likely a combined note off message
//         message.data = [status, dataArray[i + 4], dataArray[i + 5]]
//         i += 2
//       }
//       i += 3
//     } else if (status >= 144 && status <= 159) {
//       // Note On
//       message.data = [status, dataArray[i + 2], dataArray[i + 3]]
//       i += 3
//     } else if (status >= 160 && status <= 175) {
//       // Polyphonic Aftertouch
//       message.data = [status, dataArray[i + 2], dataArray[i + 3]]
//       i += 3
//     } else if (status >= 176 && status <= 191) {
//       // CC
//       message.data = [status, dataArray[i + 2], dataArray[i + 3]]
//       i += 3
//     } else if (status >= 192 && status <= 207) {
//       // Program Change
//       message.data = [status, dataArray[i + 2]]
//       i += 2
//     } else if (status >= 208 && status <= 223) {
//       // Channel Aftertouch
//       message.data = [status, dataArray[i + 2]]
//       i += 2
//     } else if (status >= 224 && status <= 239) {
//       // Pitch Bend
//       message.data = [status, dataArray[i + 2], dataArray[i + 3]]
//       // sometimes the pitch bend message is sent twice, check for that condition
//       if (dataArray[i + 4] < 128 && dataArray[i + 5] < 128) {
//         // next two bytes are not a valid status or time byte, they are likely a combined pitch bend message
//         message.data = [status, dataArray[i + 4], dataArray[i + 5]]
//         i += 2
//       }
//       i += 3
//     }
//     messages.push(message)
//   }
//   return {
//     messages,
//     errorParsing
//   }
// }
