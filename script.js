let localIP;
let peerConnection;
let dataChannel;

// Detect IP using WebRTC
function detectIP() {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');
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

// Generate a unique cosmic code
function generateCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'COSMIC-';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    localStorage.setItem(`codeForIP_${localIP || 'unknown'}`, code);
    document.getElementById('cosmicCode').value = code;
    document.getElementById('status').textContent = `Generated: ${code}. SAVE THIS—it’s your ID!`;
}

// Check if IP has a code
function checkIPForCode() {
    const savedCode = localStorage.getItem(`codeForIP_${localIP || 'unknown'}`);
    if (savedCode) {
        document.getElementById('status').textContent = `Welcome back! Your Cosmic ID: ${savedCode}.`;
        document.getElementById('cosmicCode').value = savedCode;
    }
}

// Login with generated code
function login() {
    const enteredCode = document.getElementById('cosmicCode').value;
    const savedCode = localStorage.getItem(`codeForIP_${localIP || 'unknown'}`);
    
    if (!enteredCode) {
        document.getElementById('status').textContent = 'Enter a Cosmic ID!';
        return;
    }

    if (!savedCode || enteredCode === savedCode) {
        localStorage.setItem(`codeForIP_${localIP || 'unknown'}`, enteredCode);
        localStorage.setItem('currentUser', enteredCode);
        window.location.href = 'profile.html';
    } else {
        document.getElementById('status').textContent = 'Wrong Cosmic ID! Use your generated code.';
    }
}

// Load profile and start WebRTC
function loadProfile() {
    const cosmicID = localStorage.getItem('currentUser') || 'Unknown';
    const displayName = localStorage.getItem(`displayName_${cosmicID}`) || cosmicID;
    document.getElementById('username').textContent = displayName;
    document.getElementById('cosmicID').textContent = cosmicID;
    document.getElementById('userIP').textContent = localIP || 'Unknown';
    initializePeerConnection();
}

// Initialize WebRTC Peer Connection
function initializePeerConnection() {
    const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    peerConnection = new RTCPeerConnection(configuration);

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

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            alert('Share this SDP offer with your peer: ' + JSON.stringify(peerConnection.localDescription));
        }
    };

    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        dataChannel.onmessage = (event) => {
            const chatBox = document.getElementById('chatBox');
            chatBox.value += `Peer: ${event.data}\n`;
        };
    };

    peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .catch(err => console.error(err));
}

// Connect to a peer
function connectToPeer() {
    const peerID = document.getElementById('peerID').value;
    if (peerID) {
        try {
            const peerAnswer = JSON.parse(peerID);
            peerConnection.setRemoteDescription(new RTCSessionDescription(peerAnswer))
                .catch(err => console.error(err));
        } catch (e) {
            alert('Invalid SDP! Paste a valid offer/answer.');
        }
    } else {
        alert('Enter a peer SDP!');
    }
}

// Send message via WebRTC
function sendMessage() {
    const message = document.getElementById('messageInput').value;
    if (dataChannel && dataChannel.readyState === 'open') {
        dataChannel.send(message);
        const chatBox = document.getElementById('chatBox');
        chatBox.value += `You: ${message}\n`;
        document.getElementById('messageInput').value = '';
    } else {
        alert('Connect to a peer first!');
    }
}

// Save display name
function saveName() {
    const cosmicID = localStorage.getItem('currentUser');
    const newName = document.getElementById('displayName').value;
    if (newName) {
        localStorage.setItem(`displayName_${cosmicID}`, newName);
        document.getElementById('username').textContent = newName;
        document.getElementById('displayName').value = '';
    }
}
