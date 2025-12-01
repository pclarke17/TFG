// webrtc.js
let isInitiator = false;
let localStream;
let peerConnection;

const protocol = location.protocol === "https:" ? "wss://" : "ws://";
const socket = new WebSocket(protocol + location.host);

console.log("🔗 Conectando WebSocket...");
socket.onopen = () => {
  console.log("🔗 WebSocket conectado correctamente.");
  // Arranca la captura de la escena A-Frame
  startVirtualCam();
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


// 1) Captura el canvas de A-Frame + audio micrófono
function startVirtualCam() {
  const sceneEl = document.querySelector('a-scene');
  sceneEl.addEventListener('loaded', async () => {
    // 1.1) Capture stream del canvas de A-Frame
    const sceneCanvas = sceneEl.renderer.domElement;
    const videoStream = sceneCanvas.captureStream(30);

    // 1.2) Capture audio del micrófono
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStream.getAudioTracks().forEach(track => videoStream.addTrack(track));
    } catch (err) {
      console.warn("⚠️ No se pudo capturar audio:", err);
    }

    // 1.3) Asigna a localStream y muéstralo en el plano local
    localStream = videoStream;
    attachStreamToVideoEl();

    // 1.4) Crea PeerConnection y negocia si eres iniciador
    if (!peerConnection) await createPeerConnection();
    if (isInitiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      console.log("📡 Enviando oferta SDP...");
      socket.send(JSON.stringify({ type: "offer", offer }));
    }
  });
}

// Coloca el stream en el <video> oculto y en el plano
function attachStreamToVideoEl() {
  const localVideo = document.getElementById("localVideo");
  localVideo.srcObject = localStream;
  localVideo.play();
  localVideo.onloadeddata = () => {
    document
      .querySelector("#localVideoPlane")
      .setAttribute("material", "src", "#localVideo");
  };
}

async function createPeerConnection() {
  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });
  isInitiator = true;

  // Añade todas las pistas del canvas+audio
  localStream.getTracks().forEach(track =>
    peerConnection.addTrack(track, localStream)
  );

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
    };
  };

  // 🎛️ Controles de micrófono y cámara como antes
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
}

