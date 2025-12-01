AFRAME.registerComponent('video-canvas-texture', {
    schema: {
        frameRate: { type: 'number', default: 30 },
        videoSrc: { type: 'string', default: "" }
    },  // Se aplican dos atributos para diferenciar entre nombres de video,
        // de esta manera podemos reutilizar el componente para varios archivos de video en una misma escena.

    init: function () {
        const videoSrc = this.data.videoSrc;
        if (!videoSrc) {
            console.error("❌ No se proporcionó una fuente de video.");
            return;
        }

        this.videoElement = document.createElement('video');
        this.videoElement.src = videoSrc;
        this.videoElement.crossOrigin = 'anonymous';
        this.videoElement.playsInline = true;
        this.videoElement.loop = false;  // Evitar que se repita solo
        this.videoElement.autoplay = false;
        this.videoElement.preload = "auto"; 

        console.log("🎥 Elemento de video creado con fuente:", this.videoElement.src);

        this.videoElement.addEventListener('error', () => {
            console.error(`❌ Error al cargar el video: ${videoSrc}`);
        });

        // Crear canvas para dibujar el video
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d', { willReadFrequently: true });

        // Crear textura y aplicarla al material del objeto
        this.texture = new THREE.Texture(this.canvas);
        const mesh = this.el.getObject3D('mesh');
        if (mesh) {
            mesh.material.map = this.texture;
            mesh.material.needsUpdate = true;
            console.log("🖼️ Textura aplicada al objeto.");
        } else {
            console.error('❌ No se encontró el mesh del objeto.');
            return;
        }

        // Iniciar actualización cuando el video esté listo
        this.videoElement.addEventListener('loadedmetadata', () => {
            this.canvas.width = this.videoElement.videoWidth;
            this.canvas.height = this.videoElement.videoHeight;
            console.log("📡 Metadatos del video cargados.");
        });

        // Agregar botón de control
        this.createControlButton();
    },

    createControlButton: function () {
        const button = document.createElement('a-entity');
        button.setAttribute('geometry', { primitive: 'circle', radius: 0.3 });
        button.setAttribute('material', { color: 'red', shader: 'flat' });
        button.setAttribute('position', '0 -1 0.1');
        button.setAttribute('class', 'clickable');

        button.addEventListener('click', () => {
            if (this.videoElement.paused) {
                this.videoElement.play().then(() => {
                    console.log("▶️ Video en reproducción:", this.videoElement.src);
                    this.startCanvasUpdate();
                    button.setAttribute('material', 'color', 'green');
                }).catch(err => {
                    console.error("❌ Error al iniciar el video:", err);
                });
            } else {
                this.videoElement.pause();
                console.log("⏸️ Video pausado:", this.videoElement.src);
                button.setAttribute('material', 'color', 'yellow');
            }
        });

        // Agregar otro botón para reiniciar
        const resetButton = document.createElement('a-entity');
        resetButton.setAttribute('geometry', { primitive: 'circle', radius: 0.3 });
        resetButton.setAttribute('material', { color: 'blue', shader: 'flat' });
        resetButton.setAttribute('position', '0 -1.5 0.1');
        resetButton.setAttribute('class', 'clickable');

        resetButton.addEventListener('click', () => {
            this.videoElement.currentTime = 0;
            console.log("🔄 Video reiniciado:", this.videoElement.src);
            resetButton.setAttribute('material', 'color', 'purple');
        });

        this.el.appendChild(button);
        this.el.appendChild(resetButton);
        console.log("🎬 Botones de control añadidos.");
    },

    startCanvasUpdate: function () {
        console.log("📡 Iniciando actualización del canvas...");
        this.updateCanvas();
    },

    updateCanvas: function () {
        if (this.videoElement.readyState >= this.videoElement.HAVE_ENOUGH_DATA && !this.videoElement.paused) {
            try {
                this.context.drawImage(this.videoElement, 0, 0, this.canvas.width, this.canvas.height);
                this.texture.needsUpdate = true;
            } catch (e) {
                console.error("❌ Error al actualizar el canvas:", e);
            }
        }
        if (!this.videoElement.paused) {
            requestAnimationFrame(this.updateCanvas.bind(this));
        }
    }
});
