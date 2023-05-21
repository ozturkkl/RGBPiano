"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const WebSocket = require("ws");
const nodeSsdp = require("node-ssdp");
const ws281x = require("rpi-ws281x-native");
const color = require("color");
const midi = require("midi");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const WebSocket__namespace = /* @__PURE__ */ _interopNamespaceDefault(WebSocket);
const ws281x__namespace = /* @__PURE__ */ _interopNamespaceDefault(ws281x);
const color__namespace = /* @__PURE__ */ _interopNamespaceDefault(color);
const midi__namespace = /* @__PURE__ */ _interopNamespaceDefault(midi);
const icon = path.join(__dirname, "../../resources/icon.png");
const PORT = 3192;
class Connection {
  server;
  client;
  connectingPromise;
  delinquentServerCloseTimeout;
  constructor() {
    this.server = null;
    this.client = null;
    this.connectingPromise = null;
    this.delinquentServerCloseTimeout = null;
  }
  async connect() {
    if (this.connectingPromise) {
      return await this.connectingPromise;
    }
    this.connectingPromise = new Promise(async (resolve, reject) => {
      this.client = null;
      this.server = null;
      try {
        const device = await this.searchForServer("urn:schemas-upnp-org:service:WebSocket:1");
        if (device) {
          const url = `ws://${device.LOCATION.split("//")[1]}`;
          console.log(`Connecting to ${url}`);
          const ws = new WebSocket__namespace(url);
          ws.on("open", () => {
            console.log("Connected");
            this.client = ws;
            resolve();
          });
          ws.on("error", async (err) => {
            console.error(`WebSocket error: ${err}`);
            this.client = null;
            resolve();
          });
          ws.on("close", async () => {
            console.log("Client closed");
            resolve();
          });
          return;
        }
        console.log(`No WebSocket servers with port ${PORT} found, creating one...`);
        await this.createWebSocketServer();
        resolve();
      } catch (err) {
        console.error(`Error searching/creating WebSocket servers: ${err}`);
        reject(err);
        return;
      }
    });
    await this.connectingPromise;
    this.connectingPromise = null;
  }
  send(message) {
    console.log(`Sending message: ${JSON.stringify(message)}`);
    if (this.server) {
      console.log(this.server.clients.size);
      this.server.clients.forEach((client) => {
        client.send(JSON.stringify(message));
      });
      if (this.server.clients.size === 0 && !this.delinquentServerCloseTimeout) {
        console.log(
          "Sending failed: No WebSocket clients connected. Restarting server in 15 seconds..."
        );
        this.delinquentServerCloseTimeout = setTimeout(() => {
          this.server?.close();
          this.delinquentServerCloseTimeout = null;
        }, 15e3);
      }
      if (this.server.clients.size > 0 && this.delinquentServerCloseTimeout) {
        clearTimeout(this.delinquentServerCloseTimeout);
        this.delinquentServerCloseTimeout = null;
      }
    } else if (this.client) {
      this.client.send(JSON.stringify(message));
    } else {
      console.log("Sending failed: No WebSocket connection, trying to connect again...");
      this.connect();
    }
  }
  async listen(callback) {
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
      this.server.on("close", async () => {
        console.log("WebSocket server closed, trying to reconnect...");
        await this.connect();
        this.listen(callback);
      });
    } else if (this.client) {
      this.client.on("message", (message) => {
        const data = JSON.parse(message.toString());
        callback(data);
      });
      this.client.on("error", (err) => {
        console.error(`Listen error: WebSocket error: ${err}`);
        this.client = null;
        this.listen(callback);
      });
      this.client.on("close", async () => {
        console.log("Connection closed, trying to reconnect...");
        this.client = null;
        this.listen(callback);
      });
    } else {
      console.log("Listening failed: No WebSocket connection, trying to connect...");
      await this.connect();
      this.listen(callback);
    }
  }
  createWebSocketServer() {
    return new Promise((resolve) => {
      try {
        const wss = new WebSocket__namespace.Server({ port: PORT });
        const ssdpServer = new nodeSsdp.Server({
          location: {
            port: PORT,
            path: "/"
          }
        });
        wss.on("connection", () => {
          console.log("Client connected");
        });
        wss.on("error", (err) => {
          console.error(`WebSocket server error: ${err}`);
          this.server = null;
          try {
            ssdpServer.stop();
          } catch (e) {
            console.log(`Could not stop ssdp server.`);
          }
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
          } catch (e) {
            console.log(`Could not stop ssdp server.`);
          }
          resolve();
        });
      } catch (err) {
        console.error(`Error creating WebSocket server: ${err}`);
        this.server = null;
        resolve();
      }
    });
  }
  searchForServer(searchTarget) {
    console.log(`Searching for devices...`);
    return new Promise((resolve) => {
      const client = new nodeSsdp.Client();
      client.on("response", (headers) => {
        if (headers.LOCATION.includes(`:${PORT}/`))
          resolve(headers);
      });
      client.search(searchTarget);
      setTimeout(() => {
        client.stop();
        resolve(null);
      }, 5e3);
    });
  }
}
class RgbStrip {
  NUM_LEDS = 177;
  // Number of LEDs in the strip
  BRIGHTNESS = 255;
  // The brightness level of the LEDs (0-255)
  DATA_PIN = 18;
  // The GPIO pin that the strip is connected to
  channel = ws281x__namespace(this.NUM_LEDS, {
    stripType: ws281x__namespace.stripType.WS2812,
    gpio: this.DATA_PIN,
    brightness: this.BRIGHTNESS,
    invert: false
  });
  colors = this.channel.array;
  backgroundColor = [0, 0, 0];
  setBrightness(brightness) {
    this.channel.brightness = brightness;
    ws281x__namespace.render();
  }
  setPixelColor(pixelPositionRatio, velocityRatio = 1, red = 255, green = 255, blue = 255) {
    const blendedColor = color__namespace.rgb(
      Math.round(red * velocityRatio) + Math.round(this.backgroundColor[0] * (1 - velocityRatio)),
      Math.round(green * velocityRatio) + Math.round(this.backgroundColor[1] * (1 - velocityRatio)),
      Math.round(blue * velocityRatio) + Math.round(this.backgroundColor[2] * (1 - velocityRatio))
    );
    if (pixelPositionRatio === void 0) {
      this.colors.fill(blendedColor.rgbNumber());
    } else {
      const pixelPosition = Math.round((this.NUM_LEDS - 2) * pixelPositionRatio) + 1;
      this.colors[pixelPosition] = blendedColor.rgbNumber();
    }
    ws281x__namespace.render();
  }
  setBackgroundColor(red = 0, green = 0, blue = 0) {
    this.backgroundColor = [red, green, blue];
    this.colors.fill(color__namespace.rgb(red, green, blue).rgbNumber());
    ws281x__namespace.render();
  }
  reset() {
    ws281x__namespace.reset();
  }
}
class Midi {
  devices = [];
  minNote = 21;
  maxNote = 108;
  input;
  output;
  constructor(connection) {
    this.input = new midi__namespace.Input();
    this.output = new midi__namespace.Output();
    this.devices = this.getDevices();
    this.input.on("message", (deltaTime, message) => {
      connection.send({
        type: "midi",
        data: {
          deltaTime,
          notePositionRatio: (message[1] - this.minNote) / (this.maxNote - this.minNote),
          noteVelocityRatio: message[2] / 127,
          midiChannel: message[0]
        }
      });
    });
  }
  getDevices() {
    const devices = [];
    for (let i = 0; i < this.input.getPortCount(); i++) {
      devices.push(this.input.getPortName(i));
    }
    return devices;
  }
  async openInput(device) {
    this.getDevices().forEach((d, i) => {
      if (d === device) {
        try {
          this.input.closePort();
          this.input.openPort(i);
          console.log(`Opened port ${d}`);
        } catch (e) {
          console.error(`Failed to open port ${d}: ${e}`);
        }
      }
    });
  }
}
const BACKGROUND_COLOR = [0, 2, 2];
const COLOR = [0, 255, 255];
async function mainProcess() {
  const connection = new Connection();
  await connection.connect();
  const midi2 = new Midi(connection);
  const devices = midi2.getDevices();
  devices.forEach((device) => {
    if (device.includes("Springbeats vMIDI1")) {
      midi2.openInput(device);
    }
  });
  const rgbStrip = new RgbStrip();
  rgbStrip.setBrightness(255);
  rgbStrip.setBackgroundColor(...BACKGROUND_COLOR);
  connection.listen((message) => {
    console.log(message);
    if (message?.type === "midi" && message?.data) {
      const { notePositionRatio, noteVelocityRatio, midiChannel } = message.data;
      if (midiChannel === 144) {
        rgbStrip.setPixelColor(notePositionRatio, noteVelocityRatio === 0 ? 0 : 1, ...COLOR);
      }
    }
  });
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainProcess();
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
