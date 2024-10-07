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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketP2P = void 0;
var ws_1 = __importDefault(require("ws"));
var node_ssdp_1 = require("node-ssdp");
var config_1 = require("../util/config");
var WebsocketP2P = /** @class */ (function () {
    function WebsocketP2P() {
        this.onConnectionEstablishedListeners = [];
        this.server = null;
        this.client = null;
        this.connectingPromise = null;
        this.setupDelinquentServerCleanup();
    }
    Object.defineProperty(WebsocketP2P.prototype, "onConnectionEstablished", {
        set: function (callback) {
            this.onConnectionEstablishedListeners.push(callback);
        },
        enumerable: false,
        configurable: true
    });
    WebsocketP2P.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connectingPromise) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.connectingPromise];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        this.connectingPromise = new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var device, url, ws_2;
                            var _this = this;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        this.client = null;
                                        this.server = null;
                                        return [4 /*yield*/, this.searchForServer('urn:schemas-upnp-org:service:WebSocket:1')];
                                    case 1:
                                        device = _b.sent();
                                        if (device) {
                                            url = "ws://".concat((_a = device === null || device === void 0 ? void 0 : device.LOCATION) === null || _a === void 0 ? void 0 : _a.split('//')[1]);
                                            console.log("Connecting to ws server: ".concat(url));
                                            ws_2 = new ws_1.default(url);
                                            ws_2.on('open', function () {
                                                console.log('Connected to remote server');
                                                _this.client = ws_2;
                                                resolve();
                                                _this.onConnectionEstablishedListeners.forEach(function (listener) { return listener(); });
                                            });
                                            ws_2.on('error', function (err) { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    console.error("Client error: ".concat(err));
                                                    console.log('Remote server errored, trying to reconnect...');
                                                    resolve();
                                                    setTimeout(this.connect.bind(this), 0);
                                                    return [2 /*return*/];
                                                });
                                            }); });
                                            ws_2.on('close', function () { return __awaiter(_this, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    console.log('Remote server closed, trying to reconnect...');
                                                    resolve();
                                                    setTimeout(this.connect.bind(this), 0);
                                                    return [2 /*return*/];
                                                });
                                            }); });
                                            return [2 /*return*/];
                                        }
                                        console.log("No WebSocket servers with port ".concat(config_1.PORT, " found, creating one..."));
                                        // If no WebSocket servers were found, create one
                                        return [4 /*yield*/, this.createWebSocketServer()];
                                    case 2:
                                        // If no WebSocket servers were found, create one
                                        _b.sent();
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, this.connectingPromise];
                    case 3:
                        _a.sent();
                        this.connectingPromise = null;
                        return [2 /*return*/];
                }
            });
        });
    };
    WebsocketP2P.prototype.createWebSocketServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var wss = new ws_1.default.Server({ port: config_1.PORT });
                        // Advertise the WebSocket server via SSDP
                        var ssdpServer = new node_ssdp_1.Server({
                            location: {
                                port: config_1.PORT,
                                path: '/'
                            }
                        });
                        wss.on('connection', function () {
                            console.log('Client connected');
                            resolve();
                            _this.onConnectionEstablishedListeners.forEach(function (listener) { return listener(); });
                        });
                        wss.on('error', function (err) {
                            try {
                                ssdpServer.stop();
                            }
                            catch (err) {
                                console.error("Could not stop ssdp server: ".concat(err));
                            }
                            resolve();
                            console.log('WebSocket server error, trying to reconnect...');
                            console.error(err);
                            setTimeout(_this.connect.bind(_this), 0);
                        });
                        wss.on('listening', function () {
                            ssdpServer.addUSN('urn:schemas-upnp-org:service:WebSocket:1');
                            ssdpServer.start();
                            console.log('WebSocket server created, waiting for clients...');
                            _this.server = wss;
                        });
                        wss.on('close', function () {
                            try {
                                ssdpServer.stop();
                            }
                            catch (e) {
                                console.log("Could not stop ssdp server.");
                            }
                            resolve();
                            console.log('WebSocket server closed, trying to reconnect...');
                            setTimeout(_this.connect.bind(_this), 0);
                        });
                    })];
            });
        });
    };
    WebsocketP2P.prototype.send = function (message) {
        console.log("Sending message: ".concat(JSON.stringify(message, null, 2)));
        if (this.server) {
            this.server.clients.forEach(function (client) {
                client.send(JSON.stringify(message));
            });
        }
        else if (this.client) {
            this.client.send(JSON.stringify(message));
        }
        else {
            console.warn('Sending failed: No WebSocket connection, message not sent!');
        }
    };
    WebsocketP2P.prototype.listen = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                console.log('Listening for messages...', callback.toString());
                if (this.server) {
                    this.server.clients.forEach(function (client) {
                        client.on('message', function (message) {
                            var data = JSON.parse(message.toString());
                            callback(data);
                        });
                    });
                    this.server.on('connection', function (ws) {
                        ws.on('message', function (message) {
                            var data = JSON.parse(message.toString());
                            callback(data);
                        });
                    });
                    this.server.on('error', function (err) {
                        console.error("Listen error: WebSocket server error: ".concat(err));
                        _this.onConnectionEstablished = function () { return _this.listen.bind(_this, callback); };
                    });
                    this.server.on('close', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            console.log('Listen rerun: WebSocket server closed');
                            this.onConnectionEstablished = function () { return _this.listen.bind(_this, callback); };
                            return [2 /*return*/];
                        });
                    }); });
                }
                else if (this.client) {
                    this.client.on('message', function (message) {
                        var data = JSON.parse(message.toString());
                        callback(data);
                    });
                    this.client.on('error', function (err) {
                        console.error("Listen error: WebSocket client error: ".concat(err));
                        _this.onConnectionEstablished = function () { return _this.listen.bind(_this, callback); };
                    });
                    this.client.on('close', function () { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        return __generator(this, function (_a) {
                            console.log('Listen rerun: WebSocket client closed');
                            this.onConnectionEstablished = function () { return _this.listen.bind(_this, callback); };
                            return [2 /*return*/];
                        });
                    }); });
                }
                else {
                    console.log('Listening failed: No WebSocket connection, waiting for connection...');
                    this.onConnectionEstablished = function () { return _this.listen.bind(_this, callback); };
                }
                return [2 /*return*/];
            });
        });
    };
    WebsocketP2P.prototype.searchForServer = function (searchTarget) {
        console.log("Searching for devices...");
        return new Promise(function (resolve) {
            var client = new node_ssdp_1.Client();
            client.on('response', function (headers) {
                var _a;
                if ((_a = headers === null || headers === void 0 ? void 0 : headers.LOCATION) === null || _a === void 0 ? void 0 : _a.includes(":".concat(config_1.PORT, "/")))
                    resolve(headers);
            });
            client.search(searchTarget);
            setTimeout(function () {
                client.stop();
                resolve(null);
            }, 5000);
        });
    };
    WebsocketP2P.prototype.setupDelinquentServerCleanup = function () {
        var _this = this;
        setInterval(function () {
            if (_this.server && _this.server.clients.size === 0) {
                console.log('WebSocket server has no clients, closing...');
                _this.server.close();
            }
        }, 20000 + Math.random() * 50000);
    };
    WebsocketP2P.prototype.waitForConnection = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.onConnectionEstablished = resolve;
        });
    };
    return WebsocketP2P;
}());
exports.WebsocketP2P = WebsocketP2P;
