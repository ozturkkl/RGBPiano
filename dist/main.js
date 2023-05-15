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
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("./util/websocket");
const rbgStrip_1 = require("./util/rbgStrip");
const midi_1 = require("./util/midi");
const BACKGROUND_COLOR = [0, 1, 1];
const COLOR = [0, 255, 255];
(() => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new websocket_1.Connection();
    yield connection.connect();
    const midi = new midi_1.Midi(connection);
    midi.openInput();
    const rgbStrip = new rbgStrip_1.RgbStrip();
    rgbStrip.setBrightness(255);
    rgbStrip.setBackgroundColor(...BACKGROUND_COLOR);
    connection.listen((message) => {
        console.log(message);
        if (message.type === "midi" && (message === null || message === void 0 ? void 0 : message.data)) {
            const { notePositionRatio, noteVelocityRatio, midiChannel } = message.data;
            // note
            if (midiChannel === 144) {
                rgbStrip.setPixelColor(notePositionRatio, noteVelocityRatio === 0 ? 0 : 1, ...COLOR);
            }
            // pedal
            if (midiChannel === 176) {
                rgbStrip.setBackgroundColor(...BACKGROUND_COLOR.map((c) => c * (noteVelocityRatio === 0 ? 2 : 1)));
            }
        }
    });
}))();
