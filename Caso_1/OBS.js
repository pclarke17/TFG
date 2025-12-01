console.log("🔵 OBS.js cargado");

function resolveWhipEndpoint() {
    const port = 8080;

    // 1. Si la escena se ejecuta en localhost (server local)
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        return `https://localhost:${port}/whip`;
    }

    // 2. Si la escena viene de una IP LAN como 192.168.x.x o 10.x.x.x
    if (location.hostname.match(/^192\.168\./) || location.hostname.match(/^10\./)) {
        return `https://${location.hostname}:${port}/whip`;
    }

    // 3. Si la escena se ejecuta desde GitHub Pages
    if (location.hostname.includes("github.io")) {
        // ⚠️ SUSTITUYE esto por tu IP LAN ACTUAL
        return "https://192.168.1.142:8080/whip";
    }

    // 4. Si es otro dominio, intentar mismo host
    return `https://${location.hostname}:${port}/whip`;
}

const WHIP_ENDPOINT = resolveWhipEndpoint();
console.log("🎯 WHIP endpoint seleccionado:", WHIP_ENDPOINT);

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

        // CAPTURAR VÍDEO DEL CANVAS
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
    // AUDIO DEL MICRO
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

    console.log("📨 Enviando SDP Offer al servidor WHIP:", WHIP_ENDPOINT);

    let res;
    try {
        res = await fetch(WHIP_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/sdp" },
            body: pc.localDescription.sdp
        });
    } catch (err) {
        console.error("❌ Error de conexión al servidor WHIP:", err);
        return;
    }

    if (!res.ok) {
        console.error("❌ Error HTTP en WHIP:", res.status);
        return;
    }

    const answerSdp = await res.text();
    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    console.log("🎉 WebRTC conectado correctamente con WHIP");
    window.__PC = pc; // inspección opcional
}
