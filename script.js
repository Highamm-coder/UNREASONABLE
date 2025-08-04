// Firebase services are available globally from firebase-config.js

class ChatBot {
    constructor() {
        this.apiKey = '';
        this.user = null;
        this.currentConversationId = null;
        this.conversations = [];
        this.userMessageCount = 0;
        this.firebaseReady = false;
        
        this.authContainer = document.getElementById('auth-container');
        this.appContainer = document.getElementById('app-container');
        
        // Auth form elements
        this.signinForm = document.getElementById('signin-form');
        this.createForm = document.getElementById('create-form');
        this.signinBtn = document.getElementById('signin-btn');
        this.createBtn = document.getElementById('create-btn');
        this.showCreateBtn = document.getElementById('show-create-btn');
        this.showSigninBtn = document.getElementById('show-signin-btn');
        
        // Input fields
        this.signinEmail = document.getElementById('signin-email');
        this.signinPassword = document.getElementById('signin-password');
        this.createFirstName = document.getElementById('create-firstname');
        this.createEmail = document.getElementById('create-email');
        this.createPassword = document.getElementById('create-password');
        this.confirmPassword = document.getElementById('confirm-password');
        
        this.logoutBtn = document.getElementById('logout-btn');
        
        // Navigation elements
        this.chatBtn = document.getElementById('chat-btn');
        this.conversationsBtn = document.getElementById('conversations-btn');
        this.accountBtn = document.getElementById('account-btn');
        
        // Pages
        this.chatPage = document.getElementById('chat-page');
        this.historyPage = document.getElementById('history-page');
        this.accountPage = document.getElementById('account-page');
        
        // Conversations
        this.conversationsList = document.getElementById('conversations-list');
        this.newConversationBtn = document.getElementById('new-conversation-btn');
        this.newChatBtn = document.getElementById('new-chat-btn');
        this.authLoading = document.getElementById('auth-loading');
        
        // Account management
        this.currentPasswordInput = document.getElementById('current-password');
        this.newPasswordInput = document.getElementById('new-password');
        this.confirmNewPasswordInput = document.getElementById('confirm-new-password');
        this.changePasswordBtn = document.getElementById('change-password-btn');
        this.userNameSpan = document.getElementById('user-name');
        this.userEmailSpan = document.getElementById('user-email');
        
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.apiKeyInput = document.getElementById('api-key');
        this.saveApiKeyBtn = document.getElementById('save-api-key');
        this.loading = document.getElementById('loading');
        
        this.init();
    }

    async init() {
        await this.initializeAuth();
        this.initializeEventListeners();
    }

    async initializeAuth() {
        console.log('Initializing auth...');
        
        // Disable auth buttons until Firebase is ready
        this.setAuthButtonsEnabled(false);
        
        // Wait for Firebase to be initialized
        let attempts = 0;
        while (!window.auth && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        if (!window.auth) {
            console.error('Firebase auth not initialized after waiting');
            this.showError('Failed to initialize authentication. Please refresh the page.');
            return;
        }
        
        console.log('Auth object:', window.auth);
        this.firebaseReady = true;
        this.setAuthButtonsEnabled(true);
        this.authLoading?.classList.add('hidden');
        
        window.auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user);
            
            if (user && user.email.endsWith('@deksia.com')) {
                console.log('Valid user authenticated:', user.email);
                this.user = user;
                this.authContainer.classList.add('hidden');
                this.appContainer.classList.remove('hidden');
                this.loadConfig();
                this.loadConversations();
            } else if (user && !user.email.endsWith('@deksia.com')) {
                console.log('Invalid domain for user:', user.email);
                this.showError('Only @deksia.com accounts are allowed');
                window.auth.signOut();
            } else {
                console.log('No user authenticated');
                this.user = null;
                this.authContainer.classList.remove('hidden');
                this.appContainer.classList.add('hidden');
            }
        });
    }

    setAuthButtonsEnabled(enabled) {
        if (this.signinBtn) this.signinBtn.disabled = !enabled;
        if (this.createBtn) this.createBtn.disabled = !enabled;
        
        if (enabled) {
            this.signinBtn?.classList.remove('disabled');
            this.createBtn?.classList.remove('disabled');
        } else {
            this.signinBtn?.classList.add('disabled');
            this.createBtn?.classList.add('disabled');
        }
    }

    initializeEventListeners() {
        // Auth listeners
        this.signinBtn.addEventListener('click', () => this.signIn());
        this.createBtn.addEventListener('click', () => this.createAccount());
        this.showCreateBtn.addEventListener('click', () => this.showCreateForm());
        this.showSigninBtn.addEventListener('click', () => this.showSigninForm());
        this.logoutBtn.addEventListener('click', () => this.signOutUser());

        // Enter key listeners for forms
        this.signinEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.signinPassword.focus();
        });
        this.signinPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.signIn();
        });
        this.createFirstName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createEmail.focus();
        });
        this.createEmail.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createPassword.focus();
        });
        this.createPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.confirmPassword.focus();
        });
        this.confirmPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.createAccount();
        });

        // Navigation listeners
        this.chatBtn.addEventListener('click', () => this.showPage('chat'));
        this.conversationsBtn.addEventListener('click', () => this.showPage('history'));
        this.accountBtn.addEventListener('click', () => this.showPage('account'));
        
        // Conversation listeners
        this.newConversationBtn.addEventListener('click', () => {
            this.startNewConversation();
            this.showPage('chat');
        });
        
        this.newChatBtn.addEventListener('click', () => {
            this.startNewConversation();
        });
        
        // Account management listeners
        this.changePasswordBtn.addEventListener('click', () => this.changePassword());

        // Chat listeners
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('input', () => {
            this.autoResize();
            this.updateSendButtonState();
        });

    }

    showPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected page and activate nav button
        switch(pageName) {
            case 'chat':
                this.chatPage.classList.add('active');
                this.chatBtn.classList.add('active');
                break;
            case 'history':
                this.historyPage.classList.add('active');
                this.conversationsBtn.classList.add('active');
                this.loadConversations();
                break;
            case 'account':
                this.accountPage.classList.add('active');
                this.accountBtn.classList.add('active');
                this.loadAccountInfo();
                break;
        }
    }

    showSigninForm() {
        this.signinForm.classList.remove('hidden');
        this.createForm.classList.add('hidden');
        this.clearInputs();
    }

    showCreateForm() {
        this.createForm.classList.remove('hidden');
        this.signinForm.classList.add('hidden');
        this.clearInputs();
    }

    clearInputs() {
        this.signinEmail.value = '';
        this.signinPassword.value = '';
        this.createFirstName.value = '';
        this.createEmail.value = '';
        this.createPassword.value = '';
        this.confirmPassword.value = '';
    }

    validateEmail(email) {
        if (!email.endsWith('@deksia.com')) {
            this.showError('Only @deksia.com email addresses are allowed');
            return false;
        }
        return true;
    }

    async signIn() {
        if (!this.firebaseReady || !window.auth) {
            this.showError('Authentication system is still loading. Please wait a moment and try again.');
            return;
        }

        const email = this.signinEmail.value.trim();
        const password = this.signinPassword.value;

        console.log('Attempting sign in with:', email);

        if (!email || !password) {
            this.showError('Please enter both email and password');
            return;
        }

        if (!this.validateEmail(email)) return;

        try {
            console.log('Calling signInWithEmailAndPassword...');
            const result = await window.auth.signInWithEmailAndPassword(email, password);
            console.log('Sign in successful:', result);
        } catch (error) {
            console.error('Sign in error details:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            let errorMessage = 'Sign in failed. Please try again.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please try again later';
                    break;
                case 'auth/configuration-not-found':
                    errorMessage = 'Authentication not properly configured. Please contact support.';
                    break;
            }
            
            this.showError(errorMessage);
        }
    }

    async createAccount() {
        if (!this.firebaseReady || !window.auth) {
            this.showError('Authentication system is still loading. Please wait a moment and try again.');
            return;
        }

        const firstName = this.createFirstName.value.trim();
        const email = this.createEmail.value.trim();
        const password = this.createPassword.value;
        const confirmPassword = this.confirmPassword.value;

        console.log('Attempting to create account for:', email);

        if (!firstName || !email || !password || !confirmPassword) {
            this.showError('Please fill in all fields');
            return;
        }

        if (!this.validateEmail(email)) return;

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }

        try {
            console.log('Calling createUserWithEmailAndPassword...');
            const result = await window.auth.createUserWithEmailAndPassword(email, password);
            console.log('Account creation successful:', result);
            
            // Store user information including first name
            await this.storeUserInfo(result.user, firstName);
        } catch (error) {
            console.error('Create account error details:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
            let errorMessage = 'Account creation failed. Please try again.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please choose a stronger password';
                    break;
                case 'auth/configuration-not-found':
                    errorMessage = 'Authentication not properly configured. Please contact support.';
                    break;
            }
            
            this.showError(errorMessage);
        }
    }

    async signOutUser() {
        try {
            await window.auth.signOut();
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    async loadAccountInfo() {
        if (this.user) {
            const userInfo = await this.getUserInfo();
            this.userNameSpan.textContent = (userInfo && userInfo.firstName) ? userInfo.firstName : '-';
            this.userEmailSpan.textContent = this.user.email;
        }
    }

    async changePassword() {
        const currentPassword = this.currentPasswordInput.value;
        const newPassword = this.newPasswordInput.value;
        const confirmPassword = this.confirmNewPasswordInput.value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showError('Please fill in all password fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            this.showError('New password must be at least 6 characters long');
            return;
        }

        try {
            // Re-authenticate user with current password
            const credential = firebase.auth.EmailAuthProvider.credential(
                this.user.email,
                currentPassword
            );
            await this.user.reauthenticateWithCredential(credential);
            
            // Update password
            await this.user.updatePassword(newPassword);
            
            // Clear form
            this.currentPasswordInput.value = '';
            this.newPasswordInput.value = '';
            this.confirmNewPasswordInput.value = '';
            
            this.showSuccess('Password updated successfully');
        } catch (error) {
            console.error('Password change error:', error);
            let errorMessage = 'Failed to update password';
            
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'Current password is incorrect';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'New password is too weak';
                    break;
            }
            
            this.showError(errorMessage);
        }
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.position = 'fixed';
        successDiv.style.top = '20px';
        successDiv.style.right = '20px';
        successDiv.style.background = 'rgba(0, 255, 0, 0.1)';
        successDiv.style.color = '#00ff00';
        successDiv.style.border = '1px solid rgba(0, 255, 0, 0.3)';
        successDiv.style.padding = '1rem';
        successDiv.style.borderRadius = '10px';
        successDiv.style.zIndex = '1001';
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 3000);
    }

    extractClientName(message) {
        // Try to extract client name from common patterns
        const patterns = [
            /(?:client|company|business|brand|organization)(?:\s+is\s+|\s*:\s*)([^,.!?]+)/i,
            /(?:working\s+with|helping|assisting)(?:\s+)([^,.!?]+)/i,
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is\s+my\s+client|needs\s+help|wants\s+to)/i,
            /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:has|needs|wants|is)/i
        ];

        for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }

        // If no pattern matches, try to find a proper noun at the beginning
        const words = message.split(' ');
        if (words.length > 0 && words[0].match(/^[A-Z][a-z]+$/)) {
            return words[0];
        }

        return null;
    }

    async storeUserInfo(user, firstName) {
        if (!user) return;
        
        try {
            await window.db.collection('users').doc(user.uid).set({
                firstName: firstName,
                email: user.email,
                hasLoggedInBefore: false, // Will be set to true on first welcome
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Error storing user info:', error);
        }
    }

    async getUserInfo() {
        if (!this.user) return null;
        
        try {
            const userDoc = await window.db.collection('users').doc(this.user.uid).get();
            return userDoc.exists ? userDoc.data() : null;
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    }

    async checkIfFirstLogin() {
        const userInfo = await this.getUserInfo();
        return !userInfo || !userInfo.hasLoggedInBefore;
    }

    async markUserAsReturning() {
        if (!this.user) return;
        
        try {
            await window.db.collection('users').doc(this.user.uid).set({
                email: this.user.email,
                hasLoggedInBefore: true,
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error marking user as returning:', error);
        }
    }



    async continueConversation(conversation) {
        this.currentConversationId = conversation.id;
        this.userMessageCount = conversation.messages ? conversation.messages.filter(m => m.role === 'user').length : 0;
        this.clearMessages();
        
        // Load conversation messages without typewriter effect
        if (conversation.messages && conversation.messages.length > 0) {
            conversation.messages.forEach(msg => {
                this.displayMessage(msg.content, msg.role, false, false);
            });
        }
        
        // Add continuation message with typewriter effect
        this.displayMessage('Continuing where we left off. What would you like to discuss next?', 'assistant', false, true);
        
        // Scroll to bottom after all messages are loaded
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    autoResize() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    updateSendButtonState() {
        const hasMessage = this.messageInput.value.trim().length > 0;
        const hasApiKey = this.apiKey.length > 0;
        this.sendBtn.disabled = !hasMessage || !hasApiKey;
    }

    async loadConfig() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            this.apiKey = config.apiKey;
            this.updateSendButtonState();
            
            if (this.apiKey) {
                this.startNewConversation();
            } else {
                this.displayMessage('Please configure your API key in the .env file and restart the server.', 'assistant');
            }
        } catch (error) {
            console.error('Failed to load config:', error);
            this.displayMessage('Failed to load configuration. Please check the server.', 'assistant');
        }
    }

    async startNewConversation(showWelcome = true) {
        this.currentConversationId = null;
        this.userMessageCount = 0;
        this.clearMessages();
        
        // Create new conversation in Firebase
        if (this.user) {
            try {
                const conversationRef = await window.db.collection('conversations').add({
                    userId: this.user.uid,
                    userEmail: this.user.email,
                    title: 'New Conversation',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    messages: []
                });
                this.currentConversationId = conversationRef.id;
            } catch (error) {
                console.error('Error creating conversation:', error);
            }
        }

        if (showWelcome) {
            await this.showWelcomeMessage();
        }
    }

    async showWelcomeMessage() {
        const userInfo = await this.getUserInfo();
        const isFirstLogin = !userInfo || !userInfo.hasLoggedInBefore;
        const firstName = userInfo ? userInfo.firstName : 'there';
        
        if (isFirstLogin) {
            // First-time user welcome
            this.displayMessage(`Welcome, ${firstName}!`, 'assistant');
            setTimeout(() => {
                this.displayMessage('Unreasonable transforms your client insights into exceptional experiences, so every gesture, surprise, or thoughtful moment you create builds relationships that last.', 'assistant');
                setTimeout(() => {
                    this.displayMessage('What client or company are we talking about today?', 'assistant');
                }, 3000);
            }, 2000);
            
            // Mark user as no longer first-time
            await this.markUserAsReturning();
        } else {
            // Returning user welcome
            this.displayMessage(`Welcome back, ${firstName}! Ready to continue crafting exceptional experiences?`, 'assistant');
            
            setTimeout(() => {
                this.displayMessage('You can find your previous conversations in the History section. What client or company are we talking about today?', 'assistant');
            }, 2000);
        }
    }

    async loadConversations() {
        if (!this.user) return;
        
        try {
            const querySnapshot = await window.db.collection('conversations')
                .where('userId', '==', this.user.uid)
                .orderBy('updatedAt', 'desc')
                .get();
                
            this.conversations = [];
            
            querySnapshot.forEach((doc) => {
                this.conversations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            this.renderConversationsList();
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    }

    renderConversationsList() {
        if (this.conversations.length === 0) {
            this.conversationsList.innerHTML = '<div class="no-conversations">No previous conversations found.</div>';
            return;
        }

        this.conversationsList.innerHTML = this.conversations.map(conv => {
            const date = conv.createdAt ? new Date(conv.createdAt.toDate()).toLocaleDateString() : 'Unknown date';
            const preview = conv.messages && conv.messages.length > 0 ? 
                conv.messages[0].content.substring(0, 80) + '...' : 
                'No messages yet';
            const messageCount = conv.messages ? conv.messages.length / 2 : 0; // Divide by 2 since we store user+assistant pairs
            
            return `
                <div class="conversation-item" data-id="${conv.id}">
                    <div class="conversation-header">
                        <div class="conversation-title">${conv.title}</div>
                        <div class="conversation-meta">
                            <span class="message-count">${Math.floor(messageCount)} messages</span>
                            <span class="conversation-date">${date}</span>
                        </div>
                    </div>
                    <div class="conversation-preview">${preview}</div>
                </div>
            `;
        }).join('');

        // Add click listeners to conversation items
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => {
                const conversationId = item.dataset.id;
                this.loadConversation(conversationId);
                this.showPage('chat');
            });
        });
    }

    async loadConversation(conversationId) {
        this.currentConversationId = conversationId;
        this.clearMessages();
        
        // Find the conversation in our local data
        let conversation = this.conversations.find(c => c.id === conversationId);
        
        // If not found locally, fetch from Firebase
        if (!conversation) {
            try {
                const doc = await window.db.collection('conversations').doc(conversationId).get();
                if (doc.exists) {
                    conversation = { id: doc.id, ...doc.data() };
                    // Add to local conversations array for future reference
                    this.conversations.push(conversation);
                }
            } catch (error) {
                console.error('Error loading conversation:', error);
                this.showError('Failed to load conversation');
                return;
            }
        }
        
        if (conversation && conversation.messages && conversation.messages.length > 0) {
            // Update message count for proper saving logic
            this.userMessageCount = conversation.messages.filter(m => m.role === 'user').length;
            
            // Display all previous messages without typewriter effect
            conversation.messages.forEach(msg => {
                this.displayMessage(msg.content, msg.role, false, false);
            });
            
            // Scroll to bottom to show most recent messages
            setTimeout(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }, 100);
        } else {
            // No messages in conversation yet
            this.userMessageCount = 0;
        }
    }

    saveApiKey() {
        this.showError('API key is configured via .env file. Please update the .env file and restart the server.');
    }

    clearMessages() {
        this.chatMessages.innerHTML = '';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.apiKey) return;

        this.displayMessage(message, 'user');
        this.messageInput.value = '';
        this.autoResize();
        this.updateSendButtonState();

        // Increment user message count
        this.userMessageCount++;

        this.showLoading(true);

        try {
            const response = await this.callAnthropicAPI(message);
            this.displayMessage(response, 'assistant');
            
            // Auto-save conversation after every message exchange
            await this.saveToFirebase(message, response);
        } catch (error) {
            console.error('Error:', error);
            this.displayMessage(`Error: ${error.message}`, 'assistant', true);
        } finally {
            this.showLoading(false);
        }
    }

    async saveToFirebase(userMessage, assistantResponse) {
        if (!this.currentConversationId || !this.user) return;
        
        try {
            const conversationRef = window.db.collection('conversations').doc(this.currentConversationId);
            
            // Get current conversation data - either from local or fetch from Firebase
            let conversation = this.conversations.find(c => c.id === this.currentConversationId);
            
            if (!conversation) {
                // If not found locally, fetch from Firebase to get current state
                const doc = await conversationRef.get();
                if (doc.exists) {
                    conversation = { id: doc.id, ...doc.data() };
                    // Add to local conversations array
                    this.conversations.push(conversation);
                } else {
                    conversation = { messages: [] };
                }
            }
            
            // Ensure messages array exists
            if (!conversation.messages) {
                conversation.messages = [];
            }
            
            const newMessages = [
                ...conversation.messages,
                { role: 'user', content: userMessage, timestamp: new Date() },
                { role: 'assistant', content: assistantResponse, timestamp: new Date() }
            ];
            
            // Extract client name and create title with date
            let title = conversation.title || 'New Conversation';
            if (title === 'New Conversation' && userMessage) {
                const clientName = this.extractClientName(userMessage);
                const date = new Date().toLocaleDateString();
                title = clientName ? `${clientName} - ${date}` : `Client Session - ${date}`;
            }
            
            await conversationRef.update({
                messages: newMessages,
                title: title,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Update local conversation
            conversation.messages = newMessages;
            conversation.title = title;
            
        } catch (error) {
            console.error('Error saving to Firebase:', error);
        }
    }

    getSessionId() {
        let sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    async callAnthropicAPI(message) {
        // Get conversation history from current conversation
        let conversationHistory = [];
        
        if (this.currentConversationId) {
            let conversation = this.conversations.find(c => c.id === this.currentConversationId);
            
            // If not found locally, fetch from Firebase
            if (!conversation) {
                try {
                    const doc = await window.db.collection('conversations').doc(this.currentConversationId).get();
                    if (doc.exists) {
                        conversation = { id: doc.id, ...doc.data() };
                        this.conversations.push(conversation);
                    }
                } catch (error) {
                    console.error('Error fetching conversation for API call:', error);
                }
            }
            
            if (conversation && conversation.messages) {
                conversationHistory = conversation.messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));
            }
        }
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message,
                conversationHistory 
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    }

    displayMessage(content, sender, isError = false, useTypewriter = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        if (isError) {
            messageContent.className += ' error-message';
        }
        
        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);
        
        if (sender === 'assistant' && !isError && useTypewriter) {
            this.typewriterEffect(messageContent, content);
        } else {
            messageContent.textContent = content;
        }
        
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    typewriterEffect(element, text) {
        let i = 0;
        element.textContent = '';
        
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            } else {
                clearInterval(typeInterval);
            }
        }, 15);
    }

    showLoading(show) {
        this.loading.classList.toggle('hidden', !show);
        this.sendBtn.disabled = show || !this.messageInput.value.trim() || !this.apiKey;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.right = '20px';
        errorDiv.style.zIndex = '1001';
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});