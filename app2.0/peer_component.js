export const PeerManager = (() => {
  let peer = null;

  function initializePeer(role) {
      if (!peer) {
          peer = new Peer({
              host: '0.peerjs.com',
              port: 443,
              path: '/',
              secure: true,
              debug: 3
          });

          peer.on('open', (id) => {
              console.log(`PeerJS inicializado. ID (${role}): ${id}`);

              if (role === 'transmitter') {
                  // Mostrar el Peer ID del transmisor en la pantalla
                  const idDisplay = document.createElement('div');
                  idDisplay.style.position = 'fixed';
                  idDisplay.style.top = '10px';
                  idDisplay.style.left = '10px';
                  idDisplay.style.padding = '10px';
                  idDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                  idDisplay.style.color = 'white';
                  idDisplay.style.borderRadius = '5px';
                  idDisplay.style.zIndex = '1000';
                  idDisplay.innerText = `Transmisor listo. ID: ${id}`;
                  document.body.appendChild(idDisplay);
              }
          });

          peer.on('error', (err) => {
              console.error('Error en PeerJS:', err);
          });
      }
      return peer;
  }

  return {
      getPeer: (role) => initializePeer(role),
  };
})();
