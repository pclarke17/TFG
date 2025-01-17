AFRAME.registerComponent('obs-canvas-texture', {
    schema: {
      role: { type: 'string', default: '' } // Puede ser 'transmitter' o 'receiver'
    },
  
    init: function () {
      const el = this.el;
      const role = this.data.role;
  
      // Crear un elemento de video
      const videoElement = document.createElement('video');
      videoElement.setAttribute('autoplay', 'true');
      videoElement.setAttribute('playsinline', 'true');
      videoElement.setAttribute('muted', 'false'); // El video debe estar silenciado para que se reproduzca en móviles
  
      // Crear un canvas y una textura
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 640;
      canvas.height = 360;
  
      const texture = new THREE.Texture(canvas);
      el.getObject3D('mesh').material.map = texture;
      el.getObject3D('mesh').material.needsUpdate = true;
  
      let peer = null;
  
      if (role === 'transmitter') {
        console.log("Iniciando como transmisor...");
        startTransmitter();
      } else if (role === 'receiver') {
        console.log("Iniciando como receptor...");
        addStartButton();
      } else {
        console.error("Rol inválido. No se pudo iniciar el componente.");
        return;
      }
  
      // Transmisor
      function startTransmitter() {
        peer = new Peer({
          host: '0.peerjs.com',
          port: 443,
          path: '/',
          secure: true,
          debug: 3
        });
  
        peer.on('open', (id) => {
          console.log(`Transmisor listo. ID: ${id}`);
          alert(`Comparte este ID con los receptores: ${id}`);
        });
  
        peer.on('error', (err) => console.error("Error en PeerJS:", err));
  
        navigator.mediaDevices.enumerateDevices()
          .then((devices) => {
            const obsCamera = devices.find(device => device.label.includes('OBS Virtual Camera'));
            if (!obsCamera) {
              throw new Error("OBS Virtual Camera no está disponible. Inicia la cámara virtual en OBS.");
            }
  
            return navigator.mediaDevices.getUserMedia({ video: { deviceId: obsCamera.deviceId } ,audio:{ deviceId:obsCamera}});
          })
          .then((stream) => {
            videoElement.srcObject = stream;
            videoElement.play().then(() => {
              console.log("Usando OBS Virtual Camera como entrada.");
              updateCanvas();
  
              peer.on('call', (call) => {
                console.log("Llamada entrante recibida. Respondiendo con el stream...");
                call.answer(stream);
              });
            }).catch(err => console.error("Error al reproducir el video:", err));
          })
          .catch(err => console.error("Error al acceder a OBS Virtual Camera:", err));
      }
  
      // Receptor
      function addStartButton() {
        const button = document.createElement('button');
        button.innerText = 'Iniciar Receptor';
        button.style.position = 'fixed';
        button.style.top = '50%';
        button.style.left = '50%';
        button.style.transform = 'translate(-50%, -50%)';
        button.style.padding = '1rem';
        button.style.fontSize = '1.2rem';
        document.body.appendChild(button);
  
        button.addEventListener('click', () => {
          button.remove();
          startReceiver();
        });
      }
  
      function startReceiver() {
        peer = new Peer({
          host: '0.peerjs.com',
          port: 443,
          path: '/',
          secure: true,
          debug: 3
        });
  
        peer.on('open', () => {
          const transmitterId = prompt("Ingrese el Peer ID del transmisor:");
          if (!transmitterId) return alert("Debe ingresar un Peer ID válido.");
  
          const fakeStream = createFakeStream();
          const call = peer.call(transmitterId, fakeStream);
  
          call.on('stream', (remoteStream) => {
            videoElement.srcObject = remoteStream;
            videoElement.play().then(() => {
              console.log("Reproduciendo stream remoto.");
              updateCanvas();
            }).catch(err => console.error("Error al reproducir el stream remoto:", err));
          });
        });
  
        peer.on('error', (err) => console.error("Error en PeerJS (Receptor):", err));
      }
  
      function updateCanvas() {
        if (!videoElement.paused && !videoElement.ended) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          texture.needsUpdate = true;
        }
        requestAnimationFrame(updateCanvas);
      }
  
      function createFakeStream() {
        const fakeCanvas = document.createElement('canvas');
        fakeCanvas.width = 1;
        fakeCanvas.height = 1;
        return fakeCanvas.captureStream();
      }
    }
  });
  