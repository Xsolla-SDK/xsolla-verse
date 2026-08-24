const path = require("path");
const express = require("express");
const config = require("./config");
const configureMiddleware = require("./middleware");
const configureRoutes = require("./routes");
const { Server } = require("socket.io");
const gameSocket = require("./socket/index");
const app = express();

configureMiddleware(app);
configureRoutes(app);

const HOST = "127.0.0.1";
const PORT = Number(config.PORT) || 5001;

const server = app.listen(PORT, HOST, () => {
  console.log(`Backend listening on http://${HOST}:${PORT}`);
  const io = new Server(server, {
    cors: { origin: "*" },
  });
  io.on("connection", (socket) => gameSocket.init(socket, io));
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the other process or set PORT. Vite proxies to ${HOST}:${PORT}.`
    );
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server?.close(() => process.exit(1));
});
