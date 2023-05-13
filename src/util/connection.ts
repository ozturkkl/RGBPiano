import WebSocket from "ws";
import ssdp from "node-ssdp";
import { PORT } from "../config";

export async function connect() {
  try {
    const devices = await searchDevices(
      "urn:schemas-upnp-org:service:WebSocket:1"
    );
    console.log(`Found ${devices.length} WebSocket servers`);

    // Find the first device that has a WebSocket service with the correct port
    const device = devices.find((device: any) => {
      return device.LOCATION.includes(`:${PORT}/`);
    });

    if (device) {
      const url = `ws://${device.LOCATION.split("//")[1]}`;
      console.log(`Connecting to ${url}`);
      const ws = new WebSocket(url);

      ws.on("open", () => {
        console.log("Connected");
      });

      ws.on("midi", (message: any) => {
        console.log(`Message received: ${message}`);
      });

      return ws;
    } else {
      console.error(`No WebSocket servers with port ${PORT} found, creating one...`);

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

  setInterval(() => {
    wss.emit("midi", { message: "Hello, world!" });
  }, 1000);

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

function searchDevices(searchTarget: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const client = new ssdp.Client();
    const devices: any[] = [];

    client.on("response", (headers: any) => {
      devices.push(headers);
    });

    client.search(searchTarget);

    setTimeout(() => {
      client.stop();
      resolve(devices);
    }, 1000);
  });
}
