// firebase-config.js - Complete Firebase Configuration for TripSync
// Project: tripsync-web (tripsync-ddbf5)

(function () {
    // Flag to track if we should use demo mode
    window.USE_DEMO_MODE = false;
    
    // Check if Firebase is loaded
    if (!window.firebase || !firebase.auth) {
        console.warn("Firebase not loaded - switching to demo mode");
        window.USE_DEMO_MODE = true;
        return;
    }

    // Firebase configuration - YOUR ACTUAL CONFIG
    const firebaseConfig = {
        apiKey: "AIzaSyD19chNn-4XIDxBT3MM1aXte4K8W5kKjUA",
        authDomain: "tripsync-ddbf5.firebaseapp.com",
        projectId: "tripsync-ddbf5",
        storageBucket: "tripsync-ddbf5.appspot.com",
        messagingSenderId: "182845026212",
        appId: "1:182845026212:web:37dfb3ee10f6e05b88a5a0",
        measurementId: "G-LHL5F9CNSM"
    };

    // Try to initialize Firebase
    try {
        // Initialize Firebase (only if not already initialized)
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized with TripSync project");
        } else {
            console.log("✅ Firebase already initialized");
        }

        // Get Firebase services
        const auth = firebase.auth();
        const db = firebase.firestore ? firebase.firestore() : null;
        const storage = firebase.storage ? firebase.storage() : null;

        // Set LOCAL persistence
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                console.log("✅ Firebase persistence set to LOCAL");
            })
            .catch((error) => {
                console.error("Persistence error:", error);
                if (error.code === 'auth/api-key-not-valid') {
                    console.warn("Invalid API key - switching to demo mode");
                    window.USE_DEMO_MODE = true;
                    showDemoModeNotification();
                }
            });

        // One-time "auth is initialized" promise
        window.authReady = new Promise((resolve) => {
            let resolved = false;
            const unsubscribe = auth.onAuthStateChanged((user) => {
                if (!resolved) { 
                    resolved = true; 
                    console.log("🔐 Firebase auth ready");
                    unsubscribe();
                    resolve(); 
                }
            }, (error) => {
                // Handle auth errors
                if (error && error.code === 'auth/api-key-not-valid') {
                    console.warn("Invalid API key detected - switching to demo mode");
                    window.USE_DEMO_MODE = true;
                    resolved = true;
                    unsubscribe();
                    showDemoModeNotification();
                    resolve();
                }
            });
        });

        // Make services globally available
        window.firebaseAuth = auth;
        window.firebaseDB = db;
        window.firebaseStorage = storage;

        console.log("✅ Firebase configuration complete - API Key: ......" + firebaseConfig.apiKey.slice(-6));

    } catch (error) {
        console.error("Firebase initialization error:", error);
        window.USE_DEMO_MODE = true;
        showDemoModeNotification();
    }

    // Function to show demo mode notification
    function showDemoModeNotification() {
        // Only show on the main page, not dashboard
        if (window.location.pathname.includes('dashboard')) return;
        
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                animation: slideIn 0.3s ease;
                max-width: 350px;
            `;
            notification.innerHTML = `
                <strong>Welcome to TripSync!</strong><br>
                <span style="font-size: 14px; opacity: 0.95;">
                    Firebase is currently unavailable. Click "Try Demo" to explore all features without signing in.
                </span>
            `;
            document.body.appendChild(notification);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }, 1000);
    }

    // Add animation styles if not present
    if (!document.querySelector('#firebaseAnimations')) {
        const style = document.createElement('style');
        style.id = 'firebaseAnimations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
})();

// Override auth functions to use demo mode when needed
window.addEventListener('DOMContentLoaded', function() {
    // If demo mode is active, override the login functions
    if (window.USE_DEMO_MODE) {
        console.log("Demo mode active - auth functions will use local storage");
        
        // Override the login function
        window.originalLogin = window.login;
        window.login = function(event) {
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            
            // Just save to localStorage for demo
            const email = document.getElementById('email').value || 'demo@tripsync.com';
            localStorage.setItem('userToken', 'demo_token_' + Date.now());
            localStorage.setItem('userEmail', email);
            localStorage.setItem('demoMode', 'true');
            
            // Show success message
            if (window.showNotification) {
                window.showNotification('Demo login successful!', 'success');
            }
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        };
        
        // Override the signup function
        window.originalSignup = window.signup;
        window.signup = function(event) {
            if (event && event.preventDefault) {
                event.preventDefault();
            }
            
            const email = document.getElementById('signupEmail').value || 'demo@tripsync.com';
            const name = document.getElementById('signupName').value || 'Demo User';
            
            localStorage.setItem('userToken', 'demo_token_' + Date.now());
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
            localStorage.setItem('demoMode', 'true');
            
            if (window.showNotification) {
                window.showNotification('Demo account created!', 'success');
            }
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        };
        
        // Override Google sign in
        window.originalGoogleSignIn = window.googleSignIn;
        window.googleSignIn = function() {
            localStorage.setItem('userToken', 'demo_google_' + Date.now());
            localStorage.setItem('userEmail', 'demo@gmail.com');
            localStorage.setItem('userName', 'Demo Google User');
            localStorage.setItem('demoMode', 'true');
            
            if (window.showNotification) {
                window.showNotification('Demo Google login successful!', 'success');
            }
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        };
    }
});

// Simplified demo mode starter (works even if Firebase fails)
window.startDemoMode = function() {
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('userToken', 'demo_token_' + Date.now());
    localStorage.setItem('userEmail', 'demo@tripsync.com');
    localStorage.setItem('userName', 'Demo User');
    window.location.href = 'dashboard.html';
};

console.log("Firebase config loaded - Project: tripsync-web");
