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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new websocket_1.Connection();
    yield connection.connect();
    try {
        const midiModule = require("./util/midi");
        const midi = new midiModule.Midi(connection);
        yield midi.openInput();
    }
    catch (e) {
        console.error("Failed to open midi input:", e);
    }
    connection.listen((message) => {
        console.log(message);
    });
}))();
