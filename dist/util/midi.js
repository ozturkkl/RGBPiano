"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Midi = void 0;
class Midi {
    // input: midi.Input;
    // output: midi.Output;
    constructor(connection) {
        // this.input = new midi.Input();
        // this.output = new midi.Output();
        // this.devices = this.getDevices();
        this.devices = [];
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
