let isInitiator = false;
let localStream;
let peerConnection;
let currentVideoSource = 'scene'; // Inicia con la escena A-Frame
let audioTrack = null; // Para mantener la pista de audio

const protocol = location.protocol === "https:" ? "wss://" : "ws://";
const socket = new WebSocket(protocol + location.host);

console.log("🔗 Conectando WebSocket...");
socket.onopen = () => {
  console.log("🔗 WebSocket conectado correctamente.");
  startVideoCapture();
};

socket.onmessage = async (event) => {
  const data = JSON.parse(event.data);
  console.log("📨 Mensaje recibido:", data);

  if (!peerConnection) await createPeerConnection();

  if (data.type === "offer") {
    console.log("📡 Oferta SDP recibida.");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.send(JSON.stringify({ type: "answer", answer }));
  }

  if (data.type === "answer") {
    console.log("✅ Respuesta SDP recibida.");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  }

  if (data.type === "ice-candidate") {
    console.log("❄️ ICE Candidate recibido.");
    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
};

function startVideoCapture() {
  const sceneEl = document.querySelector('a-scene');
  const webcamStatus = document.getElementById('webcamStatus');
  const videoSourceSelect = document.getElementById('videoSourceSelect');

  sceneEl.addEventListener('loaded', async () => {
    // Capturar audio del micrófono
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioTrack = audioStream.getAudioTracks()[0];
      webcamStatus.textContent = 'Audio activo';
    } catch (err) {
      console.warn("⚠️ No se pudo capturar audio:", err);
      webcamStatus.textContent = 'Sin audio disponible';
    }

    // Iniciar con la escena A-Frame
    await switchVideoSource('scene');

    // Escuchar cambios en la fuente de video
    videoSourceSelect.addEventListener('change', async () => {
      const newSource = videoSourceSelect.value;
      await switchVideoSource(newSource);
    });
  });
}

async function switchVideoSource(source) {
  const sceneEl = document.querySelector('a-scene');
  const webcamStatus = document.getElementById('webcamStatus');
  const localVideo = document.getElementById('localVideo');

  // Detener el stream actual si existe
  if (localStream) {
    localStream.getVideoTracks().forEach(track => track.stop());
  }

  let videoStream;
  if (source === 'webcam') {
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      webcamStatus.textContent = 'Webcam activa';
      currentVideoSource = 'webcam';
    } catch (err) {
      console.warn("⚠️ No se pudo capturar webcam:", err);
      webcamStatus.textContent = 'Webcam no disponible, usando escena';
      await switchVideoSource('scene'); // Fallback a escena
      return;
    }
  } else {
    const sceneCanvas = sceneEl.renderer.domElement;
    videoStream = sceneCanvas.captureStream(30);
    webcamStatus.textContent = 'Escena A-Frame activa';
    currentVideoSource = 'scene';
  }

  // Crear nuevo stream combinando video y audio (si existe)
  localStream = new MediaStream();
  videoStream.getVideoTracks().forEach(track => localStream.addTrack(track));
  if (audioTrack) localStream.addTrack(audioTrack);

  // Asignar al elemento <video>
  localVideo.srcObject = localStream;
  localVideo.play().catch(err => console.error("❌ Error al reproducir localVideo:", err));
  localVideo.onloadeddata = () => {
    document.querySelector("#localVideoPlane").setAttribute("material", "src", "#localVideo");
  };

  // Actualizar pistas en peerConnection si existe
  if (peerConnection) {
    const videoTrack = localStream.getVideoTracks()[0];
    const sender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
    if (sender) {
      await sender.replaceTrack(videoTrack);
      console.log(`🔄 Pista de video actualizada a ${source}`);
    }
  }

  // Crear peerConnection si no existe
  if (!peerConnection) await createPeerConnection();
}

async function createPeerConnection() {
  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });
  isInitiator = true;

  // Añadir pistas del stream local
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.onicecandidate = (evt) => {
    if (evt.candidate) {
      socket.send(JSON.stringify({ type: "ice-candidate", candidate: evt.candidate }));
    }
  };

  peerConnection.ontrack = (event) => {
    console.log("🎥 Stream recibido del otro usuario.");
    const remoteVideo = document.createElement("video");
    remoteVideo.autoplay = true;
    remoteVideo.playsInline = true;
    remoteVideo.style.position = "absolute";
    remoteVideo.style.top = "-9999px";
    remoteVideo.style.left = "-9999px";
    document.body.appendChild(remoteVideo);
    remoteVideo.srcObject = event.streams[0];

    remoteVideo.onloadeddata = () => {
      console.log("🎬 Video remoto listo, usando canvas como textura...");
      const remoteCanvas = document.getElementById("remoteCanvas");
      const ctx = remoteCanvas.getContext("2d");
      const plane = document.querySelector("#remoteVideoPlane");

      function drawFrame() {
        ctx.drawImage(remoteVideo, 0, 0, remoteCanvas.width, remoteCanvas.height);
        if (plane.components.material.material.map) {
          plane.components.material.material.map.needsUpdate = true;
        }
        if (typeof remoteVideo.requestVideoFrameCallback === 'function') {
          remoteVideo.requestVideoFrameCallback(drawFrame);
        } else {
          setTimeout(drawFrame, 33);
        }
      }
      drawFrame();
      plane.setAttribute("material", "src", "#remoteCanvas");
      plane.setAttribute("visible", "true");
    };
  };

  // Controles de micrófono y video
  const toggleMicBtn = document.createElement("button");
  toggleMicBtn.textContent = "🎙️ Mute";
  toggleMicBtn.style = "position: fixed; bottom: 20px; left: 20px; z-index: 10;";
  document.body.appendChild(toggleMicBtn);

  const toggleCamBtn = document.createElement("button");
  toggleCamBtn.textContent = "🎥 Stop Video";
  toggleCamBtn.style = "position: fixed; bottom: 20px; left: 120px; z-index: 10;";
  document.body.appendChild(toggleCamBtn);

  let micEnabled = true;
  let camEnabled = true;

  toggleMicBtn.addEventListener("click", () => {
    micEnabled = !micEnabled;
    localStream.getAudioTracks().forEach(t => t.enabled = micEnabled);
    toggleMicBtn.textContent = micEnabled ? "🎙️ Mute" : "🔇 Unmute";
  });

  toggleCamBtn.addEventListener("click", () => {
    camEnabled = !camEnabled;
    localStream.getVideoTracks().forEach(t => t.enabled = camEnabled);
    toggleCamBtn.textContent = camEnabled ? "🎥 Stop Video" : "📷 Start Video";
  });

  // Enviar oferta si es iniciador
  if (isInitiator) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log("📡 Enviando oferta SDP...");
    socket.send(JSON.stringify({ type: "offer", offer }));
  }
}