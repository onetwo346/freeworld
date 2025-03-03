let localIP;

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

// Generate a one-time cosmic code
function generateCode() {
    const existingCode = localStorage.getItem(`codeForIP_${localIP}`);
    if (existingCode) {
        document.getElementById('status').textContent = `Your existing Cosmic ID is: ${existingCode}. Use it to log in!`;
        document.getElementById('cosmicCode').value = existingCode;
        return;
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'COSMIC-';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    localStorage.setItem(`codeForIP_${localIP}`, code); // Tie code to IP
    document.getElementById('cosmicCode').value = code;
    document.getElementById('status').textContent = `Generated: ${code}. SAVE THIS CODE! It’s your ID!`;
}

// Check if IP already has a code
function checkIPForCode() {
    const savedCode = localStorage.getItem(`codeForIP_${localIP}`);
    if (savedCode) {
        document.getElementById('status').textContent = `Welcome back! Your Cosmic ID is: ${savedCode}. Enter it to log in.`;
        document.getElementById('cosmicCode').value = savedCode;
    }
}

// Login logic
function login() {
    const enteredCode = document.getElementById('cosmicCode').value;
    const savedCode = localStorage.getItem(`codeForIP_${localIP}`);
    
    if (!savedCode && enteredCode) {
        localStorage.setItem(`codeForIP_${localIP}`, enteredCode); // First-time save
        localStorage.setItem('currentUser', enteredCode);
        window.location.href = 'profile.html';
    } else if (enteredCode === savedCode) {
        localStorage.setItem('currentUser', enteredCode);
        window.location.href = 'profile.html';
    } else {
        document.getElementById('status').textContent = 'Invalid Cosmic ID! Use your generated code or generate a new one.';
    }
}

// Load profile data
function loadProfile() {
    const cosmicID = localStorage.getItem('currentUser') || 'Unknown';
    const displayName = localStorage.getItem(`displayName_${cosmicID}`) || cosmicID;
    document.getElementById('username').textContent = displayName;
    document.getElementById('cosmicID').textContent = cosmicID;
    document.getElementById('userIP').textContent = localIP || 'Unknown';
    loadComments(cosmicID);
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

// Post a comment
function postComment() {
    const cosmicID = localStorage.getItem('currentUser');
    const displayName = localStorage.getItem(`displayName_${cosmicID}`) || cosmicID;
    const comment = document.getElementById('commentInput').value;
    if (comment) {
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        comments.push({ user: displayName, text: comment, date: new Date().toLocaleString() });
        localStorage.setItem('comments', JSON.stringify(comments));
        document.getElementById('commentInput').value = '';
        loadComments(cosmicID);
    }
}

// Load comments
function loadComments(cosmicID) {
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const commentBox = document.getElementById('commentBox');
    commentBox.value = comments.map(c => `${c.user} (${c.date}): ${c.text}`).join('\n');
}
