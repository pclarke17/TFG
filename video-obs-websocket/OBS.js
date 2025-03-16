document.addEventListener("DOMContentLoaded", async function () {
    const scene = document.querySelector("a-scene");

    if (scene.hasLoaded) {
        startStreaming();
    } else {
        scene.addEventListener("loaded", startStreaming);
    }
});

async function startStreaming() {
    const canvas = document.querySelector("a-scene").canvas;
    if (!canvas) {
        console.error("❌ No se encontró el canvas de A-Frame.");
        return;
    }

    try {
        // Capturar video del canvas
        const videoStream = canvas.captureStream(60); // 60 FPS

        // Capturar audio del micrófono
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Combinar audio y video en un solo stream
        const combinedStream = new MediaStream([
            ...videoStream.getTracks(),
            ...audioStream.getTracks()
        ]);

        // Conectar con el servidor WebSocket
        const socket = new WebSocket("ws://127.0.0.1:5002");

        socket.onopen = function () {
            console.log("🔗 Conectado al servidor WebSocket con audio y video.");

            // Configurar MediaRecorder con audio y video
            const mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: "video/webm; codecs=vp8,opus", // Agregar códec de audio Opus
                videoBitsPerSecond: 5000000, // Mayor calidad de video
                audioBitsPerSecond: 128000, // Mayor calidad de audio
            });

            mediaRecorder.ondataavailable = async (event) => {
                if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                    socket.send(event.data);
                }
            };

            mediaRecorder.start(50); // Fragmentos cada 50ms
        };

        socket.onerror = function (error) {
            console.error("❌ Error en WebSocket:", error);
        };

        socket.onclose = function () {
            console.warn("🔌 Conexión cerrada con el servidor WebSocket.");
        };
    } catch (error) {
        console.error("❌ Error al acceder al micrófono:", error);
    }
}
