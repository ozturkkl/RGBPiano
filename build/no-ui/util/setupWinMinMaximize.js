"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWinMinMaximize = setupWinMinMaximize;
function setupWinMinMaximize(ipcMain, window) {
    window.on('maximize', function () { return window.webContents.send('window:maximized'); });
    window.on('unmaximize', function () { return window.webContents.send('window:unmaximized'); });
    ipcMain.handle('window:minimize', function () { return window.minimize(); });
    ipcMain.handle('window:maximize', function () {
        return window.isMaximized() ? window.unmaximize() : window.maximize();
    });
    ipcMain.handle('window:close', function () { return window.close(); });
}
