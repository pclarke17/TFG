AFRAME.registerComponent('dron-camera', {
  schema: {},

  init: function () {
    console.log("🚁 Initializing drone camera...");

    this.el.setAttribute('geometry', { primitive: 'sphere', radius: 0.3 });
    this.el.setAttribute('material', { color: 'gray' });

    this.createCamera();
    this.createCanvas();
    this.setupControls();
    this.startCanvasUpdate();
  },

  createCamera: function () {
    this.cameraEl = document.createElement('a-entity');
    this.cameraEl.setAttribute('camera', 'active: false; near: 0.1; far: 1000');
    this.cameraEl.setAttribute('position', '0 0 -1');
    this.el.appendChild(this.cameraEl);
    console.log("📷 Drone camera created correctly.");
  },

  createCanvas: function () {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 640;
    this.canvas.height = 360;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    this.screen = document.querySelector('#dron-screen');
    if (this.screen) {
      const mesh = this.screen.getObject3D('mesh');
      if (mesh) {
        mesh.material.map = this.texture;
        mesh.material.needsUpdate = true;
        console.log("✅ Texture applied correctly to `dron-screen`.");
      }
    }
  },

  setupControls: function () {
    this.velocity = new THREE.Vector3();
    this.rotationSpeed = 0.02;
    
    window.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'w': // Move forward
          this.velocity.z = -0.1;
          break;
        case 's': // Move backward
          this.velocity.z = 0.1;
          break;
        case 'a': // Move left
          this.velocity.x = -0.1;
          break;
        case 'd': // Move right
          this.velocity.x = 0.1;
          break;
        case 'ArrowUp': // Move up
          this.velocity.y = 0.1;
          break;
        case 'ArrowDown': // Move down
          this.velocity.y = -0.1;
          break;
        case 'ArrowLeft': // Rotate left
          this.el.object3D.rotation.y += this.rotationSpeed;
          break;
        case 'ArrowRight': // Rotate right
          this.el.object3D.rotation.y -= this.rotationSpeed;
          break;
      }
    });
    
    window.addEventListener('keyup', (event) => {
      if (['w', 's', 'a', 'd', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        this.velocity.set(0, 0, 0);
      }
    });
    
    this.el.sceneEl.addEventListener('tick', () => {
      this.el.object3D.position.add(this.velocity);
    });
  },

  startCanvasUpdate: function () {
    const updateFrame = () => {
      const camera = this.cameraEl.components.camera?.camera;
      if (!camera) {
        console.warn("⚠️ Drone camera not found, retrying...");
        setTimeout(updateFrame, 100);
        return;
      }

      const sceneEl = document.querySelector('a-scene');
      if (!sceneEl || !sceneEl.renderer) {
        console.warn("⚠️ Scene or renderer not available");
        setTimeout(updateFrame, 100);
        return;
      }

      const renderer = sceneEl.renderer;
      const scene = sceneEl.object3D;

      try {
        const renderTarget = new THREE.WebGLRenderTarget(this.canvas.width, this.canvas.height);
        renderer.setRenderTarget(renderTarget);
        renderer.render(scene, camera);

        const buffer = new Uint8Array(this.canvas.width * this.canvas.height * 4);
        renderer.readRenderTargetPixels(renderTarget, 0, 0, this.canvas.width, this.canvas.height, buffer);
        const imageData = new ImageData(new Uint8ClampedArray(buffer), this.canvas.width, this.canvas.height);
        
        const flippedImageData = new ImageData(this.canvas.width, this.canvas.height);
        for (let y = 0; y < this.canvas.height; y++) {
          const row = this.canvas.height - 1 - y;
          flippedImageData.data.set(
            imageData.data.subarray(y * this.canvas.width * 4, (y + 1) * this.canvas.width * 4),
            row * this.canvas.width * 4
          );
        }
        this.ctx.putImageData(flippedImageData, 0, 0);

        this.texture.needsUpdate = true;

        if (this.screen) {
          const mesh = this.screen.getObject3D('mesh');
          if (mesh) {
            mesh.material.map = this.texture;
            mesh.material.needsUpdate = true;
          }
        }
      } catch (error) {
        console.error("❌ Error updating drone camera:", error);
      }

      renderer.setRenderTarget(null);
      requestAnimationFrame(updateFrame);
    };
    updateFrame();
  }
});
