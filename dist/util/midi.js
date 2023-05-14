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
const midi_1 = __importDefault(require("@julusian/midi"));
class Midi {
    constructor(connection) {
        this.devices = [];
        this.input = null;
        this.output = null;
        this.setup();
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
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.input = new midi_1.default.Input();
            }
            catch (e) {
                console.log(e);
            }
        });
    }
}
exports.Midi = Midi;
