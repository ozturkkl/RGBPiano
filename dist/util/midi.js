"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Midi = void 0;
const midi_1 = __importDefault(require("@julusian/midi"));
class Midi {
    constructor(connection) {
        this.devices = [];
        this.input = null;
        this.output = null;
        this.input = new midi_1.default.Input();
        this.output = new midi_1.default.Output();
        // this.devices = this.getDevices();
        // this.input.on("message", (deltaTime, message) => {
        //   connection.send({
        //     type: "midi",
        //     data: {
        //       deltaTime,
        //       message,
        //     },
        //   });
        // });
    }
}
exports.Midi = Midi;
