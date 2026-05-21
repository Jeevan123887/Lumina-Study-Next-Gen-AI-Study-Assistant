// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        if (screen.classList.contains('active')) {
            screen.classList.remove('active');
            screen.classList.add('hidden-up');
        } else {
            screen.classList.remove('active', 'hidden', 'hidden-up');
            if (screen.id !== screenId) {
                screen.classList.add('hidden');
            }
        }
    });
    
    setTimeout(() => {
        const targetScreen = document.getElementById(screenId);
        targetScreen.classList.remove('hidden', 'hidden-up');
        targetScreen.classList.add('active');
        
        // Reset transforms if moving to main screen
        if (screenId === 'main-screen') {
            const content = targetScreen.querySelector('.hero-content, .login-card');
            if (content) content.style.transform = '';
        }
    }, 50);
}

function toggleAuthForm(formId) {
    // Hide all auth forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.style.display = 'none';
        form.classList.remove('active');
    });
    
    // Show the target form
    const targetForm = document.getElementById(`form-${formId}`);
    if (targetForm) {
        targetForm.style.display = 'block';
        setTimeout(() => targetForm.classList.add('active'), 10);
    }
}

function handleAuth(e, action) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    
    let loadingText = 'Processing...';
    if (action === 'login') loadingText = 'Authenticating...';
    if (action === 'register') loadingText = 'Creating Account...';
    if (action === 'forgot') loadingText = 'Sending Link...';
    
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${loadingText}`;
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        
        if (action === 'forgot') {
            alert('Password reset link sent to your email!');
            toggleAuthForm('login');
        } else {
            showScreen('main-screen');
        }
    }, 1000);
}

// 3D Parallax Effect
document.addEventListener('mousemove', (e) => {
    const scene = document.getElementById('scene');
    if (!scene) return;
    
    const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
    
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && activeScreen.id !== 'main-screen') {
        const content = activeScreen.querySelector('.hero-content, .login-card');
        if (content) {
            content.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    }
});

let currentContext = "";

const fileUpload = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('file-name');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const actionsSection = document.getElementById('actions-section');

fileUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameDisplay.textContent = `Selected: ${file.name} (Uploading...)`;
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentContext = data.extracted_text;
            fileNameDisplay.textContent = `Ready: ${file.name}`;
            
            // Enable UI
            chatInput.disabled = false;
            sendBtn.disabled = false;
            actionsSection.style.opacity = '1';
            actionsSection.style.pointerEvents = 'auto';
            
            addMessage('System', 'Document processed successfully! How would you like to explore it?');
        } else {
            fileNameDisplay.textContent = `Error: ${data.detail}`;
        }
    } catch (error) {
        fileNameDisplay.textContent = `Upload failed: ${error.message}`;
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage('User', message);
    chatInput.value = '';
    
    await requestBackend('/api/chat', { message, context: currentContext });
}

async function generateSummary() {
    if (!currentContext) return;
    addMessage('User', 'Please summarize this document.');
    await requestBackend('/api/summarize', { message: "", context: currentContext });
}

async function generateQuiz() {
    if (!currentContext) return;
    addMessage('User', 'Generate a quiz for this document.');
    await requestBackend('/api/generate_quiz', { message: "", context: currentContext });
}

function addMessage(sender, text) {
    const isUser = sender === 'User';
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user' : 'system'}`;
    
    const icon = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
    
    // Parse markdown if it's the system
    const parsedText = isUser ? text : marked.parse(text);
    
    div.innerHTML = `
        <div class="avatar">${icon}</div>
        <div class="content">${parsedText}</div>
    `;
    
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const div = document.createElement('div');
    div.className = `message system`;
    div.id = 'typing-indicator';
    div.innerHTML = `
        <div class="avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="typing-indicator">
            <span></span><span></span><span></span>
        </div>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

async function requestBackend(endpoint, body) {
    showTypingIndicator();
    chatInput.disabled = true;
    sendBtn.disabled = true;
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        removeTypingIndicator();
        
        if (response.ok) {
            addMessage('System', data.response);
        } else {
            addMessage('System', `Error: ${data.detail}`);
        }
    } catch (error) {
        removeTypingIndicator();
        addMessage('System', `Error communicating with server: ${error.message}`);
    } finally {
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }
}
