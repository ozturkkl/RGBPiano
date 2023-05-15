"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new websocket_1.Connection();
    yield connection.connect();
    const midi = new (yield Promise.resolve().then(() => __importStar(require("./util/midi")))).Midi(connection);
    midi.openInput();
    const rgbStrip = new rbgStrip_1.RgbStrip();
    rgbStrip.setBrightness(255);
    rgbStrip.setBackgroundColor(0, 15, 15);
    connection.listen((message) => {
        console.log(message);
        if (message.type === "midi" && (message === null || message === void 0 ? void 0 : message.data)) {
            const { notePositionPercent, noteVelocityPercent } = message.data;
            rgbStrip.setPixelColor(notePositionPercent, noteVelocityPercent, 0, 255, 255);
        }
    });
}))();
