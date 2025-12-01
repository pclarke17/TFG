AFRAME.registerComponent('camera-canvas-texture', {
  schema: {
    frameRate: { type: 'number', default: 30 } // FPS del componente
  },

  init: function () {
    console.log("🎥 Iniciando componente camera-canvas-texture...");

    // Crear video HTML dinámico
    this.videoElement = document.createElement('video');
    this.videoElement.autoplay = true;
    this.videoElement.playsInline = true;
    this.videoElement.muted = true; // Necesario para autoplay en móviles
    this.videoElement.loop = false;

    // Crear canvas donde dibujaremos los frames de la cámara
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d', { willReadFrequently: true });

    // Crear textura ThreeJS y asignarla al mesh del objeto
    const mesh = this.el.getObject3D('mesh');
    if (!mesh) {
      console.error("❌ No se encontró un mesh para aplicar la textura.");
      return;
    }

    this.texture = new THREE.Texture(this.canvas);
    mesh.material.map = this.texture;
    mesh.material.needsUpdate = true;

    console.log("🖼️ Textura creada y asignada al objeto.");

    // Activar cámara del usuario
    this.activateCamera();
  },

  activateCamera: function () {
    console.log("📡 Solicitando acceso a la cámara del usuario...");

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        console.log("🎉 Cámara accesible.");
        this.videoElement.srcObject = stream;

        this.videoElement.onloadedmetadata = () => {
          this.canvas.width = this.videoElement.videoWidth;
          this.canvas.height = this.videoElement.videoHeight;
          this.videoElement.play();
        };
      })
      .catch(err => {
        console.error("❌ Error accediendo a la cámara:", err);
      });
  },

  tick: function () {
    // Actualizar canvas cada frame si hay datos suficientes
    if (this.videoElement.readyState >= this.videoElement.HAVE_ENOUGH_DATA) {
      this.context.drawImage(
        this.videoElement,
        0, 0,
        this.canvas.width,
        this.canvas.height
      );

      this.texture.needsUpdate = true;
    }
  }
});
