import * as dgram from 'dgram';
import * as url from 'url';
import {PORT} from "../config";

const SSDP_MULTICAST_ADDR = "239.255.255.250";
const SSDP_SEARCH_TIMEOUT = 5000;

// Send an SSDP search request and return a Promise that resolves with the discovered devices
export function searchDevices(serviceType: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const searchMsg =
      `M-SEARCH * HTTP/1.1\r\n` +
      `Host: ${SSDP_MULTICAST_ADDR}:${PORT}\r\n` +
      `Man: "ssdp:discover"\r\n` +
      `ST: ${serviceType}\r\n` +
      `MX: 2\r\n\r\n`;

    const socket = dgram.createSocket("udp4");
    socket.on("error", (err) => reject(err));

    const devices = [];
    const timer = setTimeout(() => {
      socket.close();
      resolve(devices);
    }, SSDP_SEARCH_TIMEOUT);

    socket.on("message", (msg, rinfo) => {
      const headers = msg
        .toString()
        .split("\r\n")
        .reduce((acc, line) => {
          const parts = line.split(": ");
          if (parts.length == 2) {
            acc[parts[0].toLowerCase()] = parts[1];
          }
          return acc;
        }, {});

      if (headers["st"] && headers["location"]) {
        const parsedUrl = url.parse(headers["location"]);
        const device = {
          location: headers["location"],
          serviceType: headers["st"],
          host: parsedUrl.hostname,
          port: parsedUrl.port,
        };
        devices.push(device);
      }
    });

    socket.send(
      searchMsg,
      0,
      searchMsg.length,
      PORT,
      SSDP_MULTICAST_ADDR,
      (err) => {
        if (err) {
          clearTimeout(timer);
          socket.close();
          reject(err);
        }
      }
    );
  });
}
