#!/usr/bin/env node

const http = require("http");
const config = require("../config/index");

const app = require("../app");
const logger = require("../utils/logger")("www");
const { AppDataSource } = require("../db/data-source");

/**
 * Get port from environment and store in Express.
 */

const port = config.get("web.port");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Data Source has been initialized!");
  })
  .catch((err) => {
    console.error("❌ Error during Data Source initialization", err);
  });

/**
 * Listen on provided port, on all network interfaces.
 */

server.on("error", onError);
server.listen(port);
