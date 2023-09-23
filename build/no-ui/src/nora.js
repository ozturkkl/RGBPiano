"use strict";
exports.__esModule = true;
exports.initNORA = void 0;
var http = require('http');
var express = require('express');
var RED = require('node-red');
var app = express();
// Create an HTTP server
var server = http.createServer(app);
// Create the settings object
console.log(__dirname);
var settings = {
    httpAdminRoot: '/red-admin',
    httpNodeRoot: '/red',
    userDir: "".concat(__dirname, "/../../../.node-red-data/"),
    functionGlobalContext: {} // enables global context
};
function initNORA() {
    // Initialize Node-RED
    RED.init(server, settings);
    // Serve the editor UI from /red
    app.use(settings.httpAdminRoot, RED.httpAdmin);
    // Serve the http nodes UI from /api
    app.use(settings.httpNodeRoot, RED.httpNode);
    server.listen(8000);
    // Start the runtime
    RED.start();
}
exports.initNORA = initNORA;
