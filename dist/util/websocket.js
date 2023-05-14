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
exports.Connection = void 0;
const ws_1 = __importDefault(require("ws"));
const node_ssdp_1 = __importDefault(require("node-ssdp"));
const config_1 = require("../config");
class Connection {
    constructor() {
        this.server = null;
        this.client = null;
        this.connectingPromise = null;
        this.delinquentServerCloseTimeout = null;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connectingPromise) {
                return yield this.connectingPromise;
            }
            this.connectingPromise = new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this.client = null;
                this.server = null;
                try {
                    const device = yield this.searchForServer("urn:schemas-upnp-org:service:WebSocket:1");
                    if (device) {
                        const url = `ws://${device.LOCATION.split("//")[1]}`;
                        console.log(`Connecting to ${url}`);
                        const ws = new ws_1.default(url);
                        ws.on("open", () => {
                            console.log("Connected");
                            this.client = ws;
                            resolve();
                        });
                        ws.on("error", (err) => __awaiter(this, void 0, void 0, function* () {
                            console.error(`WebSocket error: ${err}`);
                            this.client = null;
                            resolve();
                        }));
                        ws.on("close", () => __awaiter(this, void 0, void 0, function* () {
                            console.log("Client closed");
                            resolve();
                        }));
                        return;
                    }
                    console.log(`No WebSocket servers with port ${config_1.PORT} found, creating one...`);
                    // If no WebSocket servers were found, create one
                    yield this.createWebSocketServer();
                    resolve();
                }
                catch (err) {
                    console.error(`Error searching/creating WebSocket servers: ${err}`);
                    reject(err);
                    return;
                }
            }));
            yield this.connectingPromise;
            this.connectingPromise = null;
        });
    }
    send(message) {
        console.log(`Sending message: ${JSON.stringify(message)}`);
        if (this.server) {
            console.log(this.server.clients.size);
            this.server.clients.forEach((client) => {
                client.send(JSON.stringify(message));
            });
            if (this.server.clients.size === 0 &&
                !this.delinquentServerCloseTimeout) {
                console.log("Sending failed: No WebSocket clients connected. Restarting server in 15 seconds...");
                this.delinquentServerCloseTimeout = setTimeout(() => {
                    var _a;
                    (_a = this.server) === null || _a === void 0 ? void 0 : _a.close();
                    this.delinquentServerCloseTimeout = null;
                }, 15000);
            }
            if (this.server.clients.size > 0 && this.delinquentServerCloseTimeout) {
                clearTimeout(this.delinquentServerCloseTimeout);
                this.delinquentServerCloseTimeout = null;
            }
        }
        else if (this.client) {
            this.client.send(JSON.stringify(message));
        }
        else {
            console.log("Sending failed: No WebSocket connection, trying to connect again...");
            this.connect();
        }
    }
    listen(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.server) {
                this.server.on("connection", (ws) => {
                    ws.on("message", (message) => {
                        const data = JSON.parse(message.toString());
                        callback(data);
                    });
                    ws.on("error", (err) => {
                        console.error(`Listen error: WebSocket client error: ${err}`);
                        this.server = null;
                        this.listen(callback);
                    });
                });
                this.server.on("error", (err) => {
                    console.error(`Listen error: WebSocket server error: ${err}`);
                    this.server = null;
                    this.listen(callback);
                });
                this.server.on("close", () => __awaiter(this, void 0, void 0, function* () {
                    console.log("WebSocket server closed, trying to reconnect...");
                    yield this.connect();
                    this.listen(callback);
                }));
            }
            else if (this.client) {
                this.client.on("message", (message) => {
                    const data = JSON.parse(message.toString());
                    callback(data);
                });
                this.client.on("error", (err) => {
                    console.error(`Listen error: WebSocket error: ${err}`);
                    this.client = null;
                    this.listen(callback);
                });
                this.client.on("close", () => __awaiter(this, void 0, void 0, function* () {
                    console.log("Connection closed, trying to reconnect...");
                    this.client = null;
                    this.listen(callback);
                }));
            }
            else {
                console.log("Listening failed: No WebSocket connection, trying to connect...");
                yield this.connect();
                this.listen(callback);
            }
        });
    }
    createWebSocketServer() {
        return new Promise((resolve, reject) => {
            try {
                const wss = new ws_1.default.Server({ port: config_1.PORT });
                // Advertise the WebSocket server via SSDP
                const ssdpServer = new node_ssdp_1.default.Server({
                    location: {
                        port: config_1.PORT,
                        path: "/",
                    },
                });
                wss.on("connection", (ws) => {
                    console.log("Client connected");
                });
                wss.on("error", (err) => {
                    console.error(`WebSocket server error: ${err}`);
                    this.server = null;
                    try {
                        ssdpServer.stop();
                    }
                    catch (e) { }
                    resolve();
                });
                wss.on("listening", () => {
                    ssdpServer.addUSN("urn:schemas-upnp-org:service:WebSocket:1");
                    ssdpServer.start();
                    console.log("WebSocket server created");
                    this.server = wss;
                    resolve();
                });
                wss.on("close", () => {
                    console.log("WebSocket server closed");
                    this.server = null;
                    try {
                        ssdpServer.stop();
                    }
                    catch (e) { }
                    resolve();
                });
            }
            catch (err) {
                console.error(`Error creating WebSocket server: ${err}`);
                this.server = null;
                resolve();
            }
        });
    }
    searchForServer(searchTarget) {
        console.log(`Searching for devices...`);
        return new Promise((resolve) => {
            const client = new node_ssdp_1.default.Client();
            client.on("response", (headers) => {
                if (headers.LOCATION.includes(`:${config_1.PORT}/`))
                    resolve(headers);
            });
            client.search(searchTarget);
            setTimeout(() => {
                client.stop();
                resolve(null);
            }, 5000);
        });
    }
}
exports.Connection = Connection;
