# 🎥 Comunicación Multimedia en Realidad Extendida  
### Trabajo de Fin de Grado 

Este repositorio contiene la implementación completa del Trabajo de Fin de Grado **“Comunicación multimedia en realidad extendida”**, cuyo objetivo principal es explorar y diseñar un sistema capaz de **integrar vídeo, audio y comunicación en tiempo real dentro de entornos 3D interactivos basados en WebXR y A-Frame**.

El proyecto aborda dos **casos de uso fundamentales**:

---

## 🟦 Caso de uso 1: Visualización multimedia y retransmisión hacia OBS

Este caso de uso muestra cómo integrar vídeos, cámara del usuario y contenido tridimensional dentro de una escena A-Frame, y cómo transmitir dicha escena en tiempo real a **OBS Studio** mediante un servidor WHIP desarrollado en Python.

La escena funciona **por sí sola**, sin necesidad de OBS ni del servidor WHIP.  
La integración con OBS es **opcional** y solamente se requiere si deseas retransmitir la escena o utilizarla como fuente de vídeo en directo.

---

# 🌐 1. Ejecutar la escena desde GitHub Pages (sin instalación)

La escena puede visualizarse directamente desde:

👉 **https://pclarke17.github.io/TFG/Caso_1

Esto permite:

- reproducción de vídeos como texturas 3D  
- visualización de la cámara del usuario dentro de la escena  
- navegación libre en un entorno WebXR  

⚠️ **IMPORTANTE:**  
La retransmisión hacia OBS no funciona desde GitHub Pages.  
Para ello es necesario ejecutar el servidor WHIP en local (ver sección 3).

---

# 2. Ejecutar el Caso de Uso 1 en local

Para lanzar la escena con todas sus funciones:

### ✔ Servir la escena A-Frame

La escena se puede servir desde la propia URL de GitHub Pages.

# 3. Generar certificados HTTPS (requerido SOLO si quieres usar OBS)

El servidor WHIP funciona exclusivamente por HTTPS, ya que WebRTC no permite conexiones inseguras fuera de localhost.

Para ejecutarlo, necesitas generar un certificado autofirmado:

openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes

Esto creará:

cert.pem

key.pem

Colócalos dentro del archivo whip_server.py y en la misma carpeta donde se encuentre el archivo:

  # HTTPS con la ruta de tus certificados
    ssl_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_ctx.load_cert_chain(
        "/Users/pabloclarke/Documents/TFG/Video/cert.pem",
        "/Users/pabloclarke/Documents/TFG/Video/key.pem"
    )
    
✔ Si NO deseas enviar la escena a OBS:

No necesitas generar certificados ni ejecutar el servidor WHIP.

# 4. Arrancar el servidor WHIP (opcional)

Si deseas enviar vídeo a OBS, ejecuta:

python3 whip_server.py


En el terminal deberías de ver: 

🚀 WHIP HTTPS escuchando en https://0.0.0.0:8080/whip
💾 Enviando señal en vivo a OBS por UDP → udp://127.0.0.1:6000


Este servidor recibe la señal WebRTC de A-Frame, la procesa y la reenvía a OBS en formato MPEG-TS.

# 5. Configurar OBS Studio (opcional)

Solo necesario si quieres transmitir la escena.

Añadir fuente → Captura de entrada multimedia

Elegir Red (URL)

Introducir:

udp://127.0.0.1:6000


Ajustar búfer (200–400 ms recomendado)

Si todo está configurado correctamente, la cámara del usuario, los vídeos 3D y el entorno de la escena aparecerán en OBS en tiempo real.

(Si la escena no se ve en OBS y está todo corriendo, refresca la página donde estes lanzando la escena)

# 6. Componentes utilizados

Componente	Descripción
video-canvas-texture.js	Renderiza vídeos como texturas 3D dinámicas.
camera-canvas-texture.js	Captura y proyecta la cámara del usuario en objetos 3D.
OBS.js	Captura el canvas de A-Frame y envía un flujo WebRTC al servidor WHIP.
whip_server.py	Recibe la Offer, genera una Answer y reenvía la señal a OBS mediante MPEG-TS/UDP.
---

## 🟩 Caso de uso 2: Videoconferencia tridimensional en tiempo real

Este caso de uso implementa un sistema de comunicación audiovisual entre usuarios utilizando **WebRTC**, donde:

- Se establece señalización mediante WebSocket.
- Cada usuario captura su cámara local.
- Los flujos remotos se integran como texturas en entidades 3D.
- Se construye una experiencia de comunicación inmersiva dentro de una escena A-Frame.

Este escenario demuestra cómo WebRTC puede extenderse más allá de videollamadas tradicionales para generar **experiencias tridimensionales interactivas**.

---

## 🧩 Componentes principales del repositorio

El proyecto se estructura en diversos módulos coherentes con la memoria:

- **`video-canvas-texture.js`**  
  Permite usar vídeos locales o remotos como texturas dinámicas.

- **`camera-canvas-texture.js`**  
  Captura la cámara del usuario y la integra en la escena como textura.

- **`OBS.js`**  
  Captura el punto de vista del usuario y establece una sesión WHIP para enviar vídeo hacia OBS.

- **`whip_server.py`**  
  Servidor Python basado en `aiortc` y `PyAV` que recibe flujos WebRTC y los retransmite a OBS mediante MPEG-TS/UDP.

- **`index.html`**  
  Escena de demostración que integra todos los componentes del sistema.

---

## 🛠️ Tecnologías utilizadas

- **A-Frame** y **Three.js** para la construcción de entornos WebXR.  
- **WebRTC** para captura, transporte y comunicación audiovisual.  
- **WHIP (WebRTC-HTTP Ingestion Protocol)** para ingestión del flujo hacia el servidor.  
- **OBS Studio** para visualización y retransmisión.  
- **Python + aiortc + PyAV** para procesar vídeo y reenviarlo como MPEG-TS.  

Estas tecnologías permiten combinar XR, comunicación en tiempo real y producción multimedia en un mismo sistema Web.

---

## 🎯 Finalidad del proyecto

El TFG demuestra cómo es posible **integrar canales multimedia complejos en un entorno XR accesible desde el navegador**, habilitando aplicaciones como:

- Streaming inmersivo  
- Telepresencia 3D  
- Escenarios de producción audiovisual interactiva  
- Espacios colaborativos WebXR con vídeo en tiempo real  

---
