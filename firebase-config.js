// Firebase configuration will be loaded from server
let firebaseInitialized = false;

async function initializeFirebase() {
  if (firebaseInitialized) return;
  
  try {
    // Fetch Firebase config from server
    const response = await fetch('/api/config');
    const config = await response.json();
    
    if (config.firebase) {
      // Initialize Firebase
      firebase.initializeApp(config.firebase);
      
      // Initialize services
      const auth = firebase.auth();
      const db = firebase.firestore();
      const analytics = firebase.analytics();
      
      // Make available globally
      window.auth = auth;
      window.db = db;
      window.analytics = analytics;
      
      firebaseInitialized = true;
    }
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
}

// Initialize Firebase when page loads
document.addEventListener('DOMContentLoaded', initializeFirebase);