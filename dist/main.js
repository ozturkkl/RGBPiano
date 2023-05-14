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
const os_1 = __importDefault(require("os"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    // const connection = new Connection();
    // await connection.connect();
    const arch = os_1.default.arch();
    console.log(`Running on ${arch}`);
    // try{
    //   const midi = new (await import("./util/midi")).Midi(connection)
    //   await midi.openInput();
    // }
    // catch(e){
    //   console.error("Failed to open midi input:", e)
    // }
    // connection.listen((message) => {
    //   console.log(message);
    // });
}))();
