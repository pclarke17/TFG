import ssl
import asyncio
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, MediaStreamTrack
import av

# ============================================================
# CONFIGURACIÓN DE SALIDA A OBS (UDP)
# ============================================================
OUTPUT = "udp://127.0.0.1:6000"    # OBS → Media Source → udp://127.0.0.1:5000
VIDEO_WIDTH = 1280
VIDEO_HEIGHT = 720
VIDEO_FPS = 30


# ============================================================
# FIX: PTS MONOTÓNICOS PARA VIDEO (MPEG-TS requiere PTS correctos)
# ============================================================
from fractions import Fraction

class MonotonicVideoTrack(MediaStreamTrack):
    kind = "video"

    def __init__(self, track):
        super().__init__()
        self.track = track
        self.pts = 0
        self.time_base = Fraction(1, 90000)  # MPEGTS clock (90 kHz)

    async def recv(self):
        frame = await self.track.recv()
        new = frame.reformat(format="yuv420p")

        new.pts = self.pts
        new.time_base = self.time_base

        # 90kHz / 30fps = 3000 ticks
        self.pts += 3000
        return new



# ============================================================
# HANDLER WHIP POST
# ============================================================
async def whip(request):
    print("📨 SDP Offer recibida")

    params = await request.text()
    offer = RTCSessionDescription(sdp=params, type="offer")

    pc = RTCPeerConnection()

    # ------------------------------------------------------------
    # Crear salida UDP → OBS
    # ------------------------------------------------------------
    print(f"🎯 Enviando a OBS por UDP → {OUTPUT}")

    container = av.open(
        OUTPUT,
        format="mpegts",
        mode="w"
    )

    # Crear streams de salida
    video_stream = container.add_stream("libx264", rate=VIDEO_FPS)
    video_stream.width = VIDEO_WIDTH
    video_stream.height = VIDEO_HEIGHT
    video_stream.pix_fmt = "yuv420p"

    audio_stream = container.add_stream("aac")
    audio_stream.channels = 2
    audio_stream.sample_rate = 48000

    # ------------------------------------------------------------
    # Cuando llega un track WebRTC (video/audio)
    # ------------------------------------------------------------
    @pc.on("track")
    async def on_track(track):
        print(f"🎥 Track recibido: {track.kind}")

        if track.kind == "video":
            fixed = MonotonicVideoTrack(track)

            async def consume_video():
                while True:
                    frame = await fixed.recv()
                    packet = video_stream.encode(frame)
                    if packet:
                        container.mux(packet)

            asyncio.create_task(consume_video())

        elif track.kind == "audio":

            async def consume_audio():
                while True:
                    frame = await track.recv()
                    packet = audio_stream.encode(frame)
                    if packet:
                        container.mux(packet)

            asyncio.create_task(consume_audio())

    # ------------------------------------------------------------
    # Responder SDP Answer al navegador
    # ------------------------------------------------------------
    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    print("📤 Enviando SDP Answer al navegador\n")

    return web.Response(
        text=pc.localDescription.sdp,
        content_type="application/sdp",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
        }
    )


# ============================================================
# CORS: responder OPTIONS para preflight
# ============================================================
async def handle_options(request):
    return web.Response(
        status=204,
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )


# ============================================================
# INICIO DEL SERVIDOR HTTPS
# ============================================================
def main():
    app = web.Application()

    # CORS preflight
    app.router.add_route("OPTIONS", "/whip", handle_options)

    # WHIP POST
    app.router.add_post("/whip", whip)

    # HTTPS con tus certificados
    ssl_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_ctx.load_cert_chain(
        "/Users/pabloclarke/Documents/TFG/Video/cert.pem",
        "/Users/pabloclarke/Documents/TFG/Video/key.pem"
    )

    print("🚀 WHIP HTTPS escuchando en https://0.0.0.0:8080/whip")
    print(f"💾 Enviando señal en vivo a OBS por UDP → {OUTPUT}")

    web.run_app(app, host="0.0.0.0", port=8080, ssl_context=ssl_ctx)


if __name__ == "__main__":
    main()
