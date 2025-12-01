import subprocess
import websockets
import asyncio

# OBS recibirá el stream en este puerto
OBS_URL = "udp://127.0.0.1:9999"

async def handle_stream(websocket, path):
    process = subprocess.Popen(
        [
            "ffmpeg",
            "-loglevel", "error",
            "-probesize", "32",
            "-analyzeduration", "0",
            "-fflags", "nobuffer",
            "-flags", "low_delay",
            "-strict", "experimental",
            "-f", "webm",
            "-use_wallclock_as_timestamps", "1",
            "-thread_queue_size", "1024",
            "-i", "pipe:0",
            "-c:v", "libx264",
            "-preset", "ultrafast",  # ⚡ Procesamiento más rápido
            "-tune", "zerolatency",  # ⚡ Baja latencia para streaming
            "-b:v", "6000k",  # ⚡ Aumentar bitrate a 6 Mbps
            "-maxrate", "7000k",
            "-bufsize", "12000k",  # ⚡ Buffer más grande para evitar lag
            "-g", "30",  # ⚡ Keyframes cada 30 cuadros
            "-pix_fmt", "yuv420p",
            "-r", "60",  # ⚡ Forzar FFmpeg a 60 FPS
            "-f", "mpegts",
            OBS_URL,  # Enviar video directo a OBS vía UDP
        ],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    try:
        async for message in websocket:
            process.stdin.write(message)
            process.stdin.flush()
    except Exception as e:
        print(f"❌ Error en WebSocket: {e}")
    finally:
        process.stdin.close()
        process.wait()
        stderr_output = process.stderr.read().decode()
        print(f"🔴 ffmpeg error:\n{stderr_output}")

async def main():
    async with websockets.serve(handle_stream, "127.0.0.1", 5002):
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())