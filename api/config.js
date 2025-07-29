module.exports = function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method === 'GET') {
        res.status(200).json({
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
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}