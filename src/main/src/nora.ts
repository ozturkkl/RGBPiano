const http = require('http')
const express = require('express')
const RED = require('node-red')

const app = express()

// Create an HTTP server
const server = http.createServer(app)

// Create the settings object
console.log(__dirname)
const settings = {
  httpAdminRoot: '/red-admin',
  httpNodeRoot: '/red',
  userDir: `${__dirname}/../../../.node-red-data/`,
  functionGlobalContext: {} // enables global context
}

export function initNORA(): void {
  // Initialize Node-RED
  RED.init(server, settings)

  // Serve the editor UI from /red
  app.use(settings.httpAdminRoot, RED.httpAdmin)

  // Serve the http nodes UI from /api
  app.use(settings.httpNodeRoot, RED.httpNode)

  server.listen(8000)

  // Start the runtime
  RED.start()
}
