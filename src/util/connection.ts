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

      ws.on("message", (data) => {
        console.log(`Message received: ${data}`);
      });

      return ws;
    } else {
      console.error(
        `No WebSocket servers with port ${PORT} found, creating one...`
      );

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
    console.log("Sending message");
    console.log("clients: ", wss.clients.size);

    wss.emit("message", "Hello from the server");

    console.log("Message sent");
  }, 2000);

  wss.on("error", (err) => {
    console.error(`WebSocket server error: ${err}`);
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

function searchDevices(searchTarget: string): Promise<any[]> {
  console.log(`Searching for devices...`);
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
    }, 5000);
  });
}
