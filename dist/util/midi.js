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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Midi = void 0;
const midi_1 = __importDefault(require("midi"));
const readline_1 = __importDefault(require("readline"));
class Midi {
    constructor(connection) {
        this.devices = [];
        this.minNote = 21;
        this.maxNote = 108;
        this.input = new midi_1.default.Input();
        this.output = new midi_1.default.Output();
        this.devices = this.getDevices();
        this.input.on("message", (deltaTime, message) => {
            connection.send({
                type: "midi",
                data: {
                    deltaTime,
                    notePositionRatio: (message[1] - this.minNote) / (this.maxNote - this.minNote),
                    noteVelocityRatio: message[2] / 127,
                    midiChannel: message[0],
                },
            });
        });
    }
    getDevices() {
        const devices = [];
        for (let i = 0; i < this.input.getPortCount(); i++) {
            devices.push(this.input.getPortName(i));
        }
        return devices;
    }
    openInput(device) {
        return __awaiter(this, void 0, void 0, function* () {
            if (device) {
                this.getDevices().forEach((d, i) => {
                    if (d === device) {
                        try {
                            this.input.closePort();
                            this.input.openPort(i);
                            console.log(`Opened port ${d}`);
                        }
                        catch (e) {
                            console.error(`Failed to open port ${d}: ${e}`);
                        }
                    }
                });
            }
            else {
                const rl = readline_1.default.createInterface({
                    input: process.stdin,
                    output: process.stdout,
                });
                const devices = this.getDevices();
                console.log("Available devices:");
                console.log("0: Cancel");
                devices.forEach((d, i) => {
                    console.log(`${i + 1}: ${d}`);
                });
                console.log("Which device would you like to use?");
                const answer = yield new Promise((resolve) => {
                    rl.question("Device: ", (answer) => {
                        resolve(parseInt(answer));
                    });
                });
                rl.close();
                if (isNaN(answer) || answer < 1 || answer > devices.length) {
                    return;
                }
                try {
                    this.openInput(devices[answer - 1]);
                }
                catch (e) {
                    console.error(`Failed to open port ${this.devices[answer - 1]}: ${e}`);
                }
            }
        });
    }
}
exports.Midi = Midi;
