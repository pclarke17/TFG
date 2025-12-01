AFRAME.registerComponent('video-canvas-texture', {
    schema: {
      videoSrc: {type: 'string'}
    },
    init: function () {
      const video = document.createElement('video');
      video.setAttribute('crossorigin', 'anonymous');
      video.setAttribute('playsinline', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('muted', 'true');
      video.setAttribute('loop', '');
  
      video.src = this.data.videoSrc;
      video.load();
      video.play();
  
      this.video = video;
  
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
  
      this.el.addEventListener('loaded', () => {
        const mesh = this.el.getObject3D('mesh');
        if (mesh) {
          mesh.material.map = texture;
          mesh.material.needsUpdate = true;
        }
      });
    }
  });
  