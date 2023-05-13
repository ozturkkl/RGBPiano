import * as WebSocket from "ws";
import * as ssdp from "node-ssdp";
import { searchDevices } from "./ssdpSearch";
import {PORT} from "../config";

export async function connect() {
  try {
    const devices = await searchDevices("urn:schemas-upnp-org:service:WebSocket:1");
    console.log(`Found ${devices.length} WebSocket servers`);
    console.log(`Devices: ${JSON.stringify(devices, null, 2)}`);

    // Find the first device that has a WebSocket service with the correct port
    const device = devices.find((device: any) => {
      return device.services?.WebSocket?.controlUrl?.port === PORT;
    });

    if (device) {
      console.log(`Connecting to ${device.friendlyName}`);
      const service = device.services.WebSocket;
      const url = `ws://${device.host}:${service.controlUrl.port}${service.controlUrl.path}`;
      console.log(`Connecting to ${url}`);
      const ws = new WebSocket(url);

      ws.on("open", () => {
        console.log("Connected");
      });

      return ws;
    } else {
      console.error("No WebSocket servers found, creating one...");

      // If no WebSocket servers were found, create one
      return createWebSocketServer();
    }
  } catch (err) {
    console.error(`Error searching for WebSocket servers: ${err}`);

    // If an error occurred, create a WebSocket server
    return createWebSocketServer();
  }
}

function createWebSocketServer() {
  const wss = new WebSocket.Server({ port: PORT });

  wss.on("connection", (ws) => {
    console.log("Client connected");
  });

  // Advertise the WebSocket server via SSDP
  const ssdpServer = new ssdp.Server({
    location: {
      port: PORT,
      path: "/",
    },
  });
  ssdpServer.addUSN("urn:schemas-upnp-org:service:WebSocket:1");
  ssdpServer.start();

  console.log("WebSocket server created");

  return wss;
}
