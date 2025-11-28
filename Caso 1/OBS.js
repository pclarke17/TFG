console.log("🔵 OBS.js cargado");

document.addEventListener("DOMContentLoaded", () => {
    console.log("⏳ DOM cargado, esperando A-Frame...");

    function waitForScene() {
        const scene = AFRAME.scenes[0];

        if (!scene || !scene.canvas) {
            console.log("⏳ esperando a que AFRAME.scenes[0] y canvas existan...");
            return setTimeout(waitForScene, 200);
        }

        console.log("🔥 Canvas encontrado, capturando ahora...");

        const canvas = scene.canvas;

        // 🎥 CAPTURAR VÍDEO DEL CANVAS
        const stream = canvas.captureStream(30);
        window.AFRAME_STREAM = stream;

        console.log("🎥 STREAM:", stream);

        const videoTrack = stream.getVideoTracks()[0];
        if (!videoTrack) {
            console.error("❌ No hay pista de video en el stream.");
            return;
        }

        console.log("🎬 SETTINGS:", videoTrack.getSettings());

        startWebRTC(stream);
    }

    waitForScene();
});

async function startWebRTC(videoStream) {
    // 🎙️ AUDIO DEL MICRO
    let audioStream;
    try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
        console.error("❌ Error accediendo al micrófono:", err);
        return;
    }

    const mixed = new MediaStream([
        videoStream.getVideoTracks()[0],
        ...audioStream.getAudioTracks()
    ]);

    const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    mixed.getTracks().forEach(t => pc.addTrack(t, mixed));

    function waitIce() {
        return new Promise(res => {
            if (pc.iceGatheringState === "complete") return res();
            pc.addEventListener("icegatheringstatechange", () => {
                if (pc.iceGatheringState === "complete") res();
            });
        });
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await waitIce();

    console.log("📨 Enviando SDP Offer al servidor WHIP...");

    const res = await fetch("https://192.168.1.119:8080/whip", {
        method: "POST",
        headers: { "Content-Type": "application/sdp" },
        body: pc.localDescription.sdp
    });

    if (!res.ok) {
        console.error("❌ Error HTTP en WHIP:", res.status);
        return;
    }

    const answerSdp = await res.text();
    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    console.log("🎉 WebRTC conectado");
    window.__PC = pc; // por si queremos inspeccionar en consola
}
