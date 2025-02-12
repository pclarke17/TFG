import { PeerManager } from './peer_component.js';

AFRAME.registerComponent('obs-canvas-texture', {
  schema: {
    role: { type: 'string', default: '' },
    peerid: { type: 'string', default: '' }
  },

  init: function () {
    this.role = this.data.role;
    this.peer = PeerManager.getPeer(this.role);
    this.streamAssigned = false;

    // Crear el elemento video
    this.videoElement = document.createElement('video');
    this.videoElement.setAttribute('autoplay', 'true');
    this.videoElement.setAttribute('playsinline', 'true');
    this.videoElement.setAttribute('muted', 'true');
    this.videoElement.setAttribute('loop', 'true');

    // Crear el canvas y la textura
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.canvas.width = 640;
    this.canvas.height = 360;
    this.texture = new THREE.CanvasTexture(this.canvas);

    // Asignar la textura al `a-box`
    this.el.addEventListener('loaded', () => {
      const mesh = this.el.getObject3D('mesh');
      if (mesh) {
        mesh.material.map = this.texture;
        mesh.material.needsUpdate = true;
      } else {
        console.error("No se pudo asignar la textura de OBS.");
      }
    });

    if (this.role === 'receiver') {
      this.startReceiver();
    } else if (this.role === 'transmitter') {
      this.startTransmitter();
    }
  },

  startTransmitter: function () {
    console.log("Buscando OBS Virtual Camera...");

    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        console.log("Dispositivos detectados:", devices.map(d => d.label));

        const obsDevice = devices.find(device => device.label.includes("OBS Virtual Camera"));
        if (!obsDevice) {
          console.error("OBS Virtual Camera no encontrada. Actívala en OBS y recarga la página.");
          alert("OBS Virtual Camera no encontrada. Asegúrate de que OBS está ejecutándose y la cámara virtual está activada.");
          return Promise.reject("OBS Virtual Camera no encontrada.");
        }

        console.log("OBS Virtual Camera encontrada:", obsDevice.label);
        return navigator.mediaDevices.getUserMedia({ video: { deviceId: obsDevice.deviceId } });
      })
      .then((stream) => {
        console.log("OBS capturado con éxito.");
        this.videoElement.srcObject = stream;
        this.videoElement.play().then(() => {
          console.log("Reproducción de OBS iniciada.");
          this.updateCanvas();
        }).catch(err => console.error("Error al reproducir OBS:", err));
      })
      .catch(err => console.error("Error al acceder a OBS Virtual Camera:", err));
  },

  updateCanvas: function () {
    const updateFrame = () => {
      if (this.videoElement.readyState >= this.videoElement.HAVE_ENOUGH_DATA) {
        this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
        this.texture.needsUpdate = true;
      } else {
        console.warn("OBS aún no tiene suficientes datos.");
      }
      requestAnimationFrame(updateFrame);
    };

    updateFrame();
  }
});
