# TFG
Escenarios locales:
##-Escenario con dos videos en la escena(space-sound)
En esta escena se puede encontrar dos videos con un botón para cada uno de ellos para hacer play/pause independientemente. De esta manera podremos comprobar en las gafas la funcinalidad de sonido espacial.
Para poder acceder y visualizar la escena, se comparte la URL de github pages:


##-Escenario con dron.
En esta escena, podremos encontrar un objeto que se va moviendo de forma independiente por la escena, el cual posee una cámara que se visualiza en una pantalla dentro de la escena.
Para acceder a la escena se puede entrar directamente desde la URL de github pages:
https://pclarke17.github.io/TFG/Escenario-Dron



## Escenario para transmitir la cámara del canvas por OBS:
Como funciona:

### 📌 **1️⃣ Captura del Video en A-Frame** - OBS.js
- Se usa **WebRTC / MediaStream API** (`canvas.captureStream(60)`) para capturar la escena.
- Se obtiene el audio con `navigator.mediaDevices.getUserMedia({ audio: true })`.

### 📌 **2️⃣ Envío del Video mediante WebSockets** - OBS.js
- Se usa **WebSockets (WS)** para transmitir los fragmentos de video/audio al servidor.
- **Baja latencia y comunicación en tiempo real.**

### 📌 **3️⃣ Procesamiento del Video en el Servidor**
- `rtmp_server.py` recibe el stream y lo procesa con **FFmpeg**.
- **Convierte WebM a H.264** y lo envía a **OBS mediante RTMP o UDP**.

### 📌 **4️⃣ Transmisión del Video a OBS**
- **UDP:** `udp://127.0.0.1:9999`
- OBS recibe el video y lo muestra.

## 🚀 **Protocolos Utilizados**
| Paso | Protocolo | Función |
|------|----------|---------|
| 1️⃣ Captura del video | **WebRTC / MediaStream API** | Captura imagen y audio desde el navegador. |
| 2️⃣ Envío a WebSockets | **WebSockets (WS)** | Envío en tiempo real sin recargas. |
| 3️⃣ Procesamiento en Servidor | **FFmpeg + stdin** | Conversión y compresión del stream. |
| 4️⃣ Transmisión a OBS | UDP** | OBS recibe el video en tiempo real. |

🎥 **¡Listo para transmitir en OBS con A-Frame!** 🔥

Para probar su funcionamiento, 
Lanzaremos el servidor rtmp_server.py desde u terminal y para acceder a la escena utilizaremos githubpages: https://pclarke17.github.io/TFG/video-obs-websocket/

Para poder ver la escena en OBS, añadiremos una nueva fuente multimedia en donde copiaremos la url UDP: udp://127.0.0.1:9999
