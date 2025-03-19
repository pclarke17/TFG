AFRAME.registerComponent('dron-camera-controls', {
    schema: {},
  
    init: function () {
      console.log("🎥 Initializing drone automatic dynamic height movement...");
  
      this.step = 0;
      this.setupAutoCameraMovement();
    },
  
    setupAutoCameraMovement: function () {
      const path = [
        { position: '0 3 0', rotation: '-90 0 0' },
        { position: '5 4 0', rotation: '-90 45 0' },
        { position: '5 5 -5', rotation: '-90 90 0' },
        { position: '0 6 -5', rotation: '-90 135 0' },
        { position: '-5 5 -5', rotation: '-90 180 0' },
        { position: '-5 4 0', rotation: '-90 225 0' },
        { position: '0 3 5', rotation: '-90 270 0' },
        { position: '5 3 5', rotation: '-90 315 0' }
      ];
  
      const moveNext = () => {
        if (this.step >= path.length) this.step = 0; // Loop back to start
  
        this.el.setAttribute('animation', {
          property: 'position',
          to: path[this.step].position,
          dur: 3000,
          easing: 'linear'
        });
  
        this.el.setAttribute('animation__rotate', {
          property: 'rotation',
          to: path[this.step].rotation,
          dur: 3000,
          easing: 'easeInOutQuad'
        });
  
        this.step++;
        setTimeout(moveNext, 3000); // Wait for animation to finish before next move
      };
  
      moveNext();
    }
  });
  
// Ensure the component is applied after A-Frame has loaded
document.addEventListener("DOMContentLoaded", function () {
    const dron = document.querySelector('#dron');
    if (dron) {
        dron.setAttribute('dron-camera-controls', '');
    } else {
        console.warn("⚠️ No #dron entity found in the scene. Make sure the ID is correct.");
    }
});