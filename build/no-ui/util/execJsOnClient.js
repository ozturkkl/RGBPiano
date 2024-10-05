"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execJsOnClient = void 0;
var electron_1 = require("electron");
function execJsOnClient(func) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var mainWindow = electron_1.BrowserWindow.getAllWindows()[0];
    if (!mainWindow) {
        throw new Error('No main window found');
    }
    return mainWindow.webContents.executeJavaScript("(".concat(func, ")(").concat(args.map(function (arg) { return JSON.stringify(arg); }).join(','), ")"), true);
}
exports.execJsOnClient = execJsOnClient;
