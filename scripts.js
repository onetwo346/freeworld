// WebRTC Peer Connection Setup
let peerConnection;
let dataChannel;
let localIP;

function initializePeerConnection() {
    const configuration = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // STUN server for NAT traversal
    };
    peerConnection = new RTCPeerConnection(configuration);

    // Create data channel for messaging
    dataChannel = peerConnection.createDataChannel('chat');
    dataChannel.onmessage = (event) => {
        const chatBox = document.getElementById('chatBox');
        chatBox.value += `Peer: ${event.data}\n`;
    };
    dataChannel.onopen = () => {
        document.getElementById('connectionStatus').textContent = 'Connected to peer!';
    };
    dataChannel.onclose = () => {
        document.getElementById('connectionStatus').textContent = 'Connection closed.';
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log('ICE Candidate:', event.candidate);
            // In a real app, send this to the peer via signaling (manual for now)
            alert('Share this ICE candidate with your peer: ' + JSON.stringify(event.candidate));
        }
    };

    // Handle incoming data channel
    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        dataChannel.onmessage = (event) => {
            const chatBox = document.getElementById('chatBox');
            chatBox.value += `Peer: ${event.data}\n`;
        };
    };
}

// Detect IP using WebRTC
function detectIP() {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel(''); // Dummy channel
    pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(err => console.error(err));

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            const ipRegex = /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/;
            const ipMatch = ipRegex.exec(event.candidate.candidate);
            if (ipMatch) {
                localIP = ipMatch[1];
                document.getElementById('ipDisplay').textContent = `Your cosmic coordinates: ${localIP}`;
                pc.close();
            }
        }
    };
}

// Login Functionality
function login() {
    const cosmicCode = document.getElementById('cosmicCode').value;
    if (cosmicCode) {
        localStorage.setItem('cosmicCode', cosmicCode);
        localStorage.setItem('userIP', localIP);
        window.location.href = 'profile.html';
    } else {
        alert('Please enter a cosmic code!');
    }
}

// Load Profile Data
function loadProfile() {
    const username = localStorage.getItem('cosmicCode') || 'Cosmic Traveler';
    const userIP = localStorage.getItem('userIP') || 'Unknown';
    document.getElementById('username').textContent = username;
    document.getElementById('userIP').textContent = userIP;

    initializePeerConnection();
    // Create and send offer (manual signaling for simplicity)
    peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
            alert('Share this SDP offer with your peer: ' + JSON.stringify(peerConnection.localDescription));
        })
        .catch(err => console.error(err));
}

// Connect to Peer (Manual Signaling)
function connectToPeer() {
    const peerID = document.getElementById('peerID').value;
    if (peerID) {
        try {
            const peerAnswer = JSON.parse(peerID); // Expecting SDP answer from peer
            peerConnection.setRemoteDescription(new RTCSessionDescription(peerAnswer))
                .catch(err => console.error(err));
        } catch (e) {
            alert('Invalid peer ID! Please enter a valid SDP answer.');
        }
    } else {
        alert('Please enter a peer ID!');
    }
}

// Send Message via Data Channel
function sendMessage() {
    const message = document.getElementById('messageInput').value;
    if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(message);
        const chatBox = document.getElementById('chatBox');
        chatBox.value += `You: ${message}\n`;
        document.getElementById('messageInput').value = '';
    } else {
        alert('No active peer connection!');
    }
}
