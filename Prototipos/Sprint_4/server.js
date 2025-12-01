const fs = require("fs");
const https = require("https");
const WebSocket = require("ws");
const express = require("express");
const path = require("path");

const app = express();

// Rutas estáticas (sirve index.html, webrtc.js, etc.)
app.use(express.static(path.join(__dirname)));

// Cargar certificados auto-firmados
const server = https.createServer({
  key: fs.readFileSync("cert/key.pem"),
  cert: fs.readFileSync("cert/cert.pem")
}, app);

// Crear servidor WebSocket sobre HTTPS
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on("connection", (socket) => {
  clients.push(socket);
  console.log("🔐 Cliente conectado por WSS. Total:", clients.length);

  socket.on("message", (message) => {
    console.log("📨 Mensaje:", message);
    // Reenviar mensaje a los demás
    clients.forEach(client => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  socket.on("close", () => {
    clients = clients.filter(c => c !== socket);
    console.log("❌ Cliente desconectado. Total:", clients.length);
  });
});

// Iniciar servidor seguro en el puerto 443 (HTTPS/WSS)
server.listen(443, () => {
  console.log("🚀 Servidor HTTPS + WSS en https://localhost (puerto 443)");
});
