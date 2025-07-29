const express = require('express');
const path = require('path');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static('.'));
app.use('/public', express.static('Public'));

app.get('/api/config', (req, res) => {
    res.json({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        firebase: {
            apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyDBxLhfH1VHLgjwVujlXdnOb8rGchTKAa4',
            authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'unreasonable-af0d9.firebaseapp.com',
            projectId: process.env.FIREBASE_PROJECT_ID || 'unreasonable-af0d9',
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'unreasonable-af0d9.firebasestorage.app',
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '248309358394',
            appId: process.env.FIREBASE_APP_ID || '1:248309358394:web:1d64d203e14ca844697a03',
            measurementId: process.env.FIREBASE_MEASUREMENT_ID || 'G-N5F3YKTBD4'
        }
    });
});

// API routes are now handled by Vercel serverless functions in /api/ directory

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});