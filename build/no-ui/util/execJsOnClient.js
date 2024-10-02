"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execJsOnClient = void 0;
var electron_1 = require("electron");
function execJsOnClient(func) {
    var mainWindow = electron_1.BrowserWindow.getAllWindows()[0];
    if (!mainWindow) {
        throw new Error('No main window found');
    }
    return mainWindow.webContents.executeJavaScript("(".concat(func.toString(), ")()"), true);
}
exports.execJsOnClient = execJsOnClient;
