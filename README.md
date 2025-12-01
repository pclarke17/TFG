# 🎥 Comunicación Multimedia en Realidad Extendida  
### Trabajo de Fin de Grado 

Este repositorio contiene la implementación completa del Trabajo de Fin de Grado **“Comunicación multimedia en realidad extendida”**, cuyo objetivo principal es explorar y diseñar un sistema capaz de **integrar vídeo, audio y comunicación en tiempo real dentro de entornos 3D interactivos basados en WebXR y A-Frame**.

El proyecto aborda dos **casos de uso fundamentales**:

---

## 🟦 Caso de uso 1: Visualización multimedia y retransmisión hacia OBS

Este caso de uso demuestra cómo una escena A-Frame puede funcionar como **fuente multimedia en vivo**, integrando:

- Reproducción de vídeo como texturas dinámicas en objetos 3D.  
- Captura de la cámara del usuario y renderizado en la propia escena.  
- Captura del punto de vista del usuario.  
- Envío del flujo WebRTC a un servidor WHIP basado en Python.  
- Transcodificación y retransmisión a **OBS Studio** en formato MPEG-TS/UDP.

Permite convertir una escena WebXR en **una señal de vídeo real** apta para streaming, producción audiovisual o integración con plataformas externas.

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
