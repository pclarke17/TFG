AFRAME.registerComponent('observer-camera-stream', {
  init: function () {
    // Obtener la cámara en la cabeza del personaje
    const sceneCamera = document.querySelector('#scene-camera');
    if (!sceneCamera) {
      console.error("No se encontró la cámara en la cabeza del personaje.");
      return;
    }

    const camera = sceneCamera.getObject3D('camera');
    if (!camera || !(camera instanceof THREE.Camera)) {
      console.error("No se pudo obtener la cámara como THREE.Camera.");
      return;
    }

    // Crear un canvas donde se renderizará la vista
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 640;
    this.canvas.height = 360;

    // Crear una textura de THREE.js basada en el canvas
    this.texture = new THREE.CanvasTexture(this.canvas);
    
    // Asignar la textura al material del a-box
    this.el.addEventListener('loaded', () => {
      const mesh = this.el.getObject3D('mesh');
      if (mesh) {
        mesh.material.map = this.texture;
        mesh.material.needsUpdate = true;
      } else {
        console.error("No se pudo asignar la textura de la cámara en la cabeza del personaje.");
      }
    });

    // Obtener el renderer de A-Frame
    const renderer = sceneCamera.sceneEl.renderer;

    // Función para capturar la escena desde la cámara
    const renderScene = () => {
      renderer.render(sceneCamera.sceneEl.object3D, camera);

      // Dibujar la imagen del renderer en el canvas
      this.ctx.drawImage(renderer.domElement, 0, 0, this.canvas.width, this.canvas.height);
      this.texture.needsUpdate = true;

      requestAnimationFrame(renderScene);
    };

    renderScene();
  }
});
