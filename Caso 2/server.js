const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");
const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname)));

const server = https.createServer({
  key: fs.readFileSync("cert/key.pem"),
  cert: fs.readFileSync("cert/cert.pem")
}, app);

const wss = new WebSocket.Server({ server });

wss.on("connection", (socket) => {
  console.log("🔐 Cliente conectado.");
  socket.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      wss.clients.forEach((client) => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error("❌ Error al procesar mensaje:", err);
    }
  });
  socket.on("close", () => {
    console.log("❌ Cliente desconectado.");
  });
});

server.listen(3000,"0.0.0.0", () => {
  console.log("🚀 Servidor HTTPS + WSS en https://0.0.0.0:3000");
});