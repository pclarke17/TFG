# 🔗 WebRTC + Videoconferenecia en A-Frame

Este proyecto permite realizar una **videollamada bidireccional** entre dos usuarios utilizando **WebRTC** y visualizando el vídeo dentro de una escena **A-Frame** en 3D/VR.

## ¿Cómo funciona?

1. **Captura del vídeo y audio local** con `getUserMedia()`.
2. Se crea una conexión `RTCPeerConnection` y se usa **WebSocket** para intercambio de señales (SDP/ICE).
3. El vídeo local se asigna a una textura sobre un `<a-plane>` en A-Frame.
4. El vídeo remoto se recibe, se dibuja en un `<canvas>`, y ese canvas se usa como textura para otro `<a-plane>`.
5. Se crea una experiencia inmersiva estilo "reunión en el metaverso".

## Estructura del Proyecto

```
📁 videoconferencia-webrtc/
├── index.html              # Escena A-Frame con planos de video local y remoto
├── webrtc.js               # Lógica WebRTC + conexión WebSocket + texturizado
├── server.js               # Servidor WebSocket seguro (WSS) con Node.js
├── cert/                   # Certificados auto-firmados para HTTPS/WSS
│   ├── cert.pem
│   └── key.pem
```

## Requisitos

- Node.js (v16+)
- HTTPS local habilitado (auto-signed certificate)
- Navegadores compatibles con WebRTC: Chrome, Firefox, Edge...

## Cómo iniciar

```bash
# Instala dependencias (si usas express o similar)
npm install

# Lanza el servidor seguro
node server.js
```

Abre en el navegador:

```
https://<tu-ip-local>/
```

Ejemplo:

```
https://192.168.1.141/
```

Luego abre otro dispositivo/navegador con la misma URL.

## 🎮 Controles

- ✅ Transmisión de cámara y micrófono.
- 🎥 Los vídeos se renderizan en planos 3D dentro de la escena A-Frame.
- 🔊 El audio se reproduce desde los elementos de video automáticamente.

## 📸 Técnicas usadas

| Tecnología | Rol |
|-----------|------|
| WebRTC    | Comunicación P2P de audio/vídeo |
| WebSocket | Canal de señalización (SDP, ICE) |
| A-Frame   | Motor VR para visualización 3D de la videollamada |
| HTML5 Video & Canvas | Captura de vídeo y texturizado |
| HTTPS + WSS | Comunicación segura necesaria para WebRTC en producción |

## 🛡️ HTTPS/WSS en local

Usamos un certificado auto-firmado para desarrollo:

```js
// server.js (extracto)
const server = https.createServer({
  key: fs.readFileSync("./cert/key.pem"),
  cert: fs.readFileSync("./cert/cert.pem"),
}, app);

const wss = new WebSocket.Server({ server });
```

Puedes generarlo con:

```bash
mkdir cert
openssl req -x509 -newkey rsa:4096 -keyout cert/key.pem -out cert/cert.pem -days 365 -nodes
```

## Qué esperar una vez dentro de la escena.

Una vez se acceda a la escena, nos encontraremos con distintos botones de carácter HTML, en los que podremos apagar/encender el micrófono y la cámara, elegir qué cámara se va a transmitir y con la que el otro usuario nos verá y elegir el fondo de la escena 3D.



En cuanto a las cámaras, tendremos dos disponibles, la cámara de la escena y la webcam del navegador. Este punto está pensado para dispositivos donde no se puede acceder a sus cámaras propias, como es el caso de las gafas de realidad virtual Meta Quest 3, donde se realizaron las pruebas de visionado de la escena.





Pablo Clarke  Álvarez
Proyecto de TFG
