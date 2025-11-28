## 🚀 Guía rápida de instalación (Quick Start)

Esta sección explica cómo instalar y ejecutar la caja de herramientas VR desarrollada en este proyecto.  
El objetivo es que puedas levantar el entorno rápidamente y comprobar el funcionamiento de los componentes:

- `video-canvas-texture`
- `camera-canvas-texture`
- `OBS.js`
- `webrtc.js`

---

### 1️⃣ Requisitos previos

Antes de empezar, asegúrate de tener:

- Sistema operativo: **Windows**, **macOS** o **Linux**
- **Node.js** versión **16** o superior
- **Python 3.8** o superior (para los componentes que usan OBS/FFmpeg)
- Navegador compatible con **WebXR**:
  - Google Chrome
  - Mozilla Firefox
- Editor de texto o IDE (por ejemplo, **Visual Studio Code**)
- Conexión a Internet para descargar dependencias

---

### 2️⃣ Clonar el repositorio

Clona el repositorio o descarga el código desde GitHub:

```bash
git clone https://github.com/
pclarke17/TFG


# 🎥 VR Multimedia Toolbox — Caso 1 (A-Frame + WebRTC + WHIP + OBS)

Este repositorio incluye una caja de herramientas para integrar contenido multimedia en escenas de realidad virtual con A-Frame, permitiendo:

- reproducir vídeos como texturas 3D,
- mostrar la señal de la cámara o una cámara virtual,
- capturar la escena completa de WebGL,
- enviarla mediante WebRTC usando el protocolo **WHIP**,
- y recibirla en **OBS Studio** vía MPEG-TS/UDP.

El **Caso 1** agrupa todos estos elementos en una escena VR funcional.

---

## 📦 1. Componentes del Caso 1

### 🎞 `video-canvas-texture.js`

Permite usar un archivo de vídeo como textura de cualquier entidad 3D usando un `<canvas>` actualizado en tiempo real.

**Ejemplo de uso:**

```html
<a-box width="4" height="2.25" depth="0.1"
       video-canvas-texture="videoSrc: video.mp4"></a-box>
Características:

Crea un <video> oculto.

Copia cada frame en un <canvas>.

Usa ese canvas como textura WebGL.

Expone métodos como startCanvasUpdate() y pauseCanvasUpdate().

Inicialización automática incluida en index.html:

js
Copiar código
const videoElements = document.querySelectorAll('[video-canvas-texture]');
videoElements.forEach(el => {
  const component = el.components['video-canvas-texture'];
  if (component && component.startCanvasUpdate) {
    component.startCanvasUpdate();
  }
});
📷 camera-canvas-texture.js
Muestra la cámara del sistema o una cámara virtual (OBS Virtual Camera) como textura sobre un objeto 3D.

Ejemplo de uso:

html
Copiar código
<a-box id="video-box" width="4" height="2.25"
       camera-canvas-texture></a-box>
Características:

Detecta automáticamente la cámara virtual de OBS.

Si no está disponible, usa la webcam.

Copia los fotogramas en un canvas y actualiza la textura en tiempo real.

🌄 2. Escena VR del Caso 1 (index.html)
Incluye:

dos vídeos integrados como texturas,

un cubo con la señal de cámara,

un entorno generado con aframe-environment-component,

inicialización automática de componentes.

Ejemplo:

html
Copiar código
<a-box position="-3 1 -3"
       video-canvas-texture="videoSrc: video.mp4"></a-box>

<a-box position="5 1 2"
       video-canvas-texture="videoSrc: video2.0.mp4"></a-box>

<a-box id="video-box"></a-box>

<script>
  document.querySelector('#video-box')
          .setAttribute('camera-canvas-texture', 'role: transmitter');
</script>
🔥 3. Captura de escena y envío WHIP (OBS.js)
OBS.js captura la escena completa usando:

js
Copiar código
const stream = canvas.captureStream(30);
Luego:

Crea un RTCPeerConnection.

Añade pistas de vídeo y audio.

Genera una SDP Offer.

La envía al servidor WHIP:

js
Copiar código
const response = await fetch("https://TU-IP:8080/whip", {
  method: "POST",
  headers: { "Content-Type": "application/sdp" },
  body: offer.sdp
});
Recibe la SDP Answer.

Establece la conexión WebRTC.

Envía vídeo + audio en tiempo real.

🛰️ 4. Servidor WHIP (whip_server.py)
El servidor WHIP:

recibe la oferta del navegador,

genera la respuesta SDP,

usa aiortc para gestionar la sesión WebRTC,

decodifica vídeo con PyAV,

reenvía la señal a OBS mediante MPEG-TS/UDP.

Ejecutarlo:

bash
Copiar código
python whip_server.py
Requiere:

cert.pem

key.pem

Salida por defecto:

cpp
Copiar código
udp://127.0.0.1:9999
📡 5. Configuración de OBS Studio
OBS recibe el flujo reenviado por el servidor WHIP.

Pasos:

Abrir OBS Studio.

Añadir Fuente → Media Source.

Desactivar “Local File”.

Introducir la ruta:

cpp
Copiar código
udp://127.0.0.1:9999
Activar “Restart playback when source becomes active”.

OBS mostrará la escena VR cuando WHIP esté conectado.

🔁 6. Flujo completo del Caso 1
css
Copiar código
A-Frame (vídeos + cámara + entorno)
        ↓
canvas.captureStream()
        ↓
WebRTC → WHIP (POST /whip)
        ↓
whip_server.py (aiortc + PyAV)
        ↓
MPEG-TS/UDP
        ↓
OBS Studio (Media Source)
🧪 7. Prueba rápida
Abrir OBS Studio y añadir la fuente UDP.

Iniciar el servidor WHIP:

bash
Copiar código
python whip_server.py
Servir el proyecto:

bash
Copiar código
npx http-server .
Abrir la escena:

arduino
Copiar código
https://localhost:8080
Verificar que OBS recibe el vídeo de la escena.

🚨 8. Problemas frecuentes
OBS aparece en negro
El servidor WHIP no está ejecutándose.

El puerto UDP está bloqueado.

La escena no está enviando pistas WebRTC.

No funciona la cámara
Falta de permisos del navegador.

OBS Virtual Camera no está iniciada.

Error SSL al conectar WHIP
El navegador exige HTTPS para WebRTC + captura de canvas


