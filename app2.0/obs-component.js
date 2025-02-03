import { PeerManager } from './peer_component.js';

AFRAME.registerComponent('obs-canvas-texture', {
  schema: {
    role: { type: 'string', default: '' },
    peerid: { type: 'string', default: '' }
  },

  init: function () {
    this.role = this.data.role;
    this.peer = PeerManager.getPeer(this.role);
    this.streamAssigned = false; // Para evitar duplicaciones sin bloquear la primera asignación.

    this.videoElement = document.createElement('video');
    this.videoElement.setAttribute('autoplay', 'true');
    this.videoElement.setAttribute('playsinline', 'true');
    this.videoElement.setAttribute('muted', 'true'); // Para permitir autoplay sin bloqueo
    this.videoElement.setAttribute('loop', 'true');

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.canvas.width = 640;
    this.canvas.height = 360;
    this.texture = new THREE.Texture(this.canvas);

    this.el.addEventListener('loaded', () => {
      const mesh = this.el.getObject3D('mesh');
      if (mesh) {
        mesh.material.map = this.texture;
        mesh.material.needsUpdate = true;
      } else {
        console.error("No se pudo asignar la textura, el objeto 3D no está disponible.");
      }
    });

    if (this.role === 'transmitter') {
      this.startTransmitter();
    } else if (this.role === 'receiver') {
      this.startReceiver();
    }
  },

  startTransmitter: function () {
    console.log("Iniciando transmisión de OBS...");

    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        const obsCamera = devices.find(device => device.label.includes('OBS Virtual Camera'));
        if (!obsCamera) {
          console.error("OBS Virtual Camera no encontrada. Actívala en OBS.");
          return Promise.reject("OBS Virtual Camera no encontrada.");
        }
        return navigator.mediaDevices.getUserMedia({ video: { deviceId: obsCamera.deviceId } });
      })
      .then((stream) => {
        this.videoElement.srcObject = stream;
        this.videoElement.play().then(() => {
          console.log("Transmisión OBS activada.");
          this.updateCanvas();

          this.peer.on('connection', (conn) => {
            conn.on('open', () => {
              const call = this.peer.call(conn.peer, stream);
              console.log("Transmisión OBS enviada al receptor.");
            });
          });

          this.peer.on('call', (incomingCall) => {
            console.log("Llamada entrante para OBS. Respondiendo...");
            incomingCall.answer(stream);
          });

        }).catch(err => console.error("Error al reproducir OBS:", err));
      })
      .catch(err => console.error("Error al acceder a OBS Virtual Camera:", err));
  },

  startReceiver: function () {
    console.log("Iniciando PeerJS como receptor de OBS...");
    const transmitterId = this.data.peerid;
    if (!transmitterId) return console.error("Peer ID del transmisor no proporcionado.");

    const call = this.peer.call(transmitterId, null);
    call.on('stream', (remoteStream) => {
      console.log("Recibiendo stream OBS...");
      
      // Solo asignamos el stream si aún no está asignado.
      if (!this.streamAssigned) {
        this.videoElement.srcObject = remoteStream;
        this.videoElement.oncanplay = () => {
          console.log("El stream remoto de OBS está listo.");
          this.videoElement.play();
          this.updateCanvas();
          this.streamAssigned = true; // Se asegura de que solo se asigne una vez.
        };
      } else {
        console.warn("El stream de OBS ya estaba asignado.");
      }
    });

    call.on('error', (err) => {
      console.error("Error en la llamada OBS:", err);
    });
  },

  updateCanvas: function () {
    if (this.videoElement.readyState >= this.videoElement.HAVE_ENOUGH_DATA) {
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      this.texture.needsUpdate = true;
    } else {
      console.warn("El stream de OBS aún no tiene suficientes datos.");
    }
    requestAnimationFrame(this.updateCanvas.bind(this));
  }
});
