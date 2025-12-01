AFRAME.registerComponent('camera-canvas-texture', {
  schema: {
    frameRate: { type: 'number', default: 30 }  // Frames por segundo
  },

  init: function () {
    // Crear elemento de video para la cámara
    this.videoElement = document.createElement('video');
    this.videoElement.autoplay = true;
    this.videoElement.playsInline = true;
    this.videoElement.muted = true; // Silenciado para evitar problemas de reproducción
    this.videoElement.loop = true;

    console.log("🎥 Elemento de video creado para la cámara:", this.videoElement);

    // Crear canvas para dibujar el video
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d', { willReadFrequently: true });
    console.log("🖌️ Canvas creado con contexto 2D:", this.canvas);

    // Crear textura y asignarla al material del objeto 3D
    this.texture = new THREE.Texture(this.canvas);
    const mesh = this.el.getObject3D('mesh');
    if (mesh) {
      mesh.material.map = this.texture;
      mesh.material.needsUpdate = true;
      console.log("🖼️ Textura asignada al material del objeto 3D.");
    } else {
      console.error('❌ No se encontró el mesh del elemento.');
      return;
    }

    // Intentar acceder a cualquier cámara disponible
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        this.videoElement.srcObject = stream;
        console.log("📡 Stream de cámara recibido:", stream);

        this.videoElement.addEventListener('loadeddata', () => {
          if (this.videoElement.readyState >= this.videoElement.HAVE_CURRENT_DATA) {
            console.log("📏 Configurando canvas con dimensiones:", this.videoElement.videoWidth, this.videoElement.videoHeight);
            this.canvas.width = this.videoElement.videoWidth;
            this.canvas.height = this.videoElement.videoHeight;

            this.videoElement.play().then(() => {
              console.log("▶️ Video de la cámara reproduciéndose.");
            }).catch((error) => {
              console.error("❌ Error al reproducir el video de la cámara:", error);
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Error al acceder a la cámara:', error);
        if (error.name === 'NotAllowedError') {
          alert('Por favor, otorga permisos de cámara para que funcione el componente.');
        }
      });
  },

  tick: function () {
    // Actualizar el canvas solo si el video está listo
    if (this.videoElement.readyState >= this.videoElement.HAVE_ENOUGH_DATA) {
      try {
        this.context.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
        this.texture.needsUpdate = true;
        console.log("🖌️ Textura actualizada con frame de la cámara.");
      } catch (e) {
        console.error("❌ Error al dibujar en el canvas:", e);
      }
    } else {
      console.warn("⚠️ Stream de cámara no listo para dibujar.");
    }
  }
});