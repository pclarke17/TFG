export class PeerManager {
    static peer = null;

    static async init(role) {
        if (!PeerManager.peer) {
            PeerManager.peer = new window.Peer();
            
            return new Promise((resolve, reject) => {
                PeerManager.peer.on('open', (id) => {
                    console.log(`PeerJS inicializado. ID (${role}): ${id}`);

                    if (role === 'transmitter') {
                        const ws = new WebSocket("ws://localhost:8080");
                        ws.onopen = () => ws.send(JSON.stringify({ peerId: id }));
                    }

                    resolve(PeerManager.peer);
                });

                PeerManager.peer.on('error', (err) => {
                    console.error("Error en PeerJS:", err);
                    reject(err);
                });
            });
        }
        return PeerManager.peer;
    }

    static getPeer() {
        return PeerManager.peer;
    }
}
