AFRAME.registerComponent('dron-controls', {
    schema: {
      speed: { type: 'number', default: 0.1 }
    },
  
    init: function () {
      this.velocity = new THREE.Vector3();
      this.direction = new THREE.Vector3();
  
      window.addEventListener('keydown', (event) => {
        switch (event.code) {
          case 'ArrowUp':
            this.velocity.z = -this.data.speed;
            break;
          case 'ArrowDown':
            this.velocity.z = this.data.speed;
            break;
          case 'ArrowLeft':
            this.velocity.x = -this.data.speed;
            break;
          case 'ArrowRight':
            this.velocity.x = this.data.speed;
            break;
          case 'KeyW':
            this.velocity.y = this.data.speed;
            break;
          case 'KeyS':
            this.velocity.y = -this.data.speed;
            break;
        }
      });
  
      window.addEventListener('keyup', () => {
        this.velocity.set(0, 0, 0);
      });
    },
  
    tick: function (time, timeDelta) {
      let el = this.el;
      let position = el.getAttribute('position');
      position.x += this.velocity.x * timeDelta;
      position.y += this.velocity.y * timeDelta;
      position.z += this.velocity.z * timeDelta;
      el.setAttribute('position', position);
    }
  });
  
  // Configurar la escena
  const setupExplorationScene = () => {
    const scene = document.createElement('a-scene');
    scene.setAttribute('environment', 'preset: forest');
  
    // Dron
    const dron = document.createElement('a-entity');
    dron.setAttribute('id', 'dron');
    dron.setAttribute('position', '0 3 -3');
    dron.setAttribute('dron-camera', '');
    dron.setAttribute('dron-controls', '');
    scene.appendChild(dron);
  
    // Pantalla del dron
    const screen = document.createElement('a-box');
    screen.setAttribute('id', 'dron-screen');
    screen.setAttribute('position', '0 2 -4');
    screen.setAttribute('width', '4');
    screen.setAttribute('height', '2.25');
    screen.setAttribute('depth', '0.1');
    scene.appendChild(screen);
  
    // Cámara principal
    const camera = document.createElement('a-entity');
    camera.setAttribute('camera', '');
    camera.setAttribute('position', '0 1.6 5');
    camera.setAttribute('look-controls', '');
    camera.setAttribute('wasd-controls', '');
    scene.appendChild(camera);
  
    document.body.appendChild(scene);
  };
  
  setupExplorationScene();
  