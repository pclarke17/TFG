import { PeerManager } from './peer_component.js';

AFRAME.registerComponent('video-stream', {
  schema: {
    role: { type: 'string', default: '' },
    peerid: { type: 'string', default: '' }
  },

  init: function () {
    this.role = this.data.role;
    this.peer = PeerManager.getPeer(this.role);
    this.videoElement = document.createElement('video');
    this.videoElement.src = "video.mp4"; 
    this.videoElement.setAttribute('autoplay', 'false'); 
    this.videoElement.setAttribute('playsinline', 'true');
    this.videoElement.setAttribute('muted', 'true'); 
    this.videoElement.setAttribute('loop', 'true');
    this.videoElement.crossOrigin = "anonymous";

    this.createPlayButton();

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

    if (this.role === 'receiver') {
      this.startReceiver();
    }
  },

  createPlayButton: function () {
    const playButton = document.createElement('button');
    playButton.innerText = 'Reproducir Video';
    playButton.style.position = 'fixed';
    playButton.style.top = '50%';
    playButton.style.left = '50%';
    playButton.style.transform = 'translate(-50%, -50%)';
    playButton.style.padding = '1rem';
    playButton.style.fontSize = '1.2rem';
    playButton.style.zIndex = '1000';
    playButton.style.backgroundColor = '#007bff';
    playButton.style.color = 'white';
    playButton.style.border = 'none';
    playButton.style.borderRadius = '5px';
    playButton.style.cursor = 'pointer';
    document.body.appendChild(playButton);

    playButton.style.display = 'block';

    playButton.addEventListener('click', () => {
      this.videoElement.play().then(() => {
        console.log("El video se está reproduciendo.");
        playButton.style.display = 'none';
        this.updateCanvas();

        if (this.role === 'transmitter') {
          this.startTransmitter();
        }
      }).catch(err => {
        console.error("Error al intentar reproducir el video:", err);
      });
    });
  },

  startTransmitter: function () {
    console.log("Iniciando PeerJS como transmisor...");

    const stream = this.videoElement.captureStream();
    this.peer.on('connection', (conn) => {
      conn.on('open', () => {
        const call = this.peer.call(conn.peer, stream);
        console.log("Transmisión de video enviada.");
      });
    });

    this.peer.on('call', (incomingCall) => {
      console.log("Llamada entrante recibida. Respondiendo con el stream del video...");
      incomingCall.answer(stream);
    });
  },

  startReceiver: function () {
    console.log("Iniciando PeerJS como receptor de video...");
    const transmitterId = this.data.peerid;
    if (!transmitterId) return console.error("Peer ID del transmisor no proporcionado.");

    console.log(`Conectándose a PeerJS ID del transmisor: ${transmitterId}`);

    const call = this.peer.call(transmitterId, null);
    call.on('stream', (remoteStream) => {
        console.log("Recibiendo stream de video...");
        this.videoElement.srcObject = remoteStream;
        this.videoElement.oncanplay = () => {
            console.log("El stream remoto de video está listo.");
            this.videoElement.play();
            this.updateCanvas();
        };
    });

    call.on('error', (err) => {
        console.error("Error en la llamada de video:", err);
    });
  },

  updateCanvas: function () {
    if (this.videoElement.readyState >= this.videoElement.HAVE_ENOUGH_DATA) {
      this.ctx.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
      this.texture.needsUpdate = true;
    }
    requestAnimationFrame(this.updateCanvas.bind(this));
  }
});
