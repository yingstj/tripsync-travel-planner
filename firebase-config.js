// firebase-config.js - Classic script version (no modules, no top-level await)
// Assumes Firebase compat scripts are loaded globally

(function () {
    // Check if Firebase is loaded
    if (!window.firebase || !firebase.auth) {
        console.error("Firebase not loaded - make sure Firebase scripts are loaded before this file");
        return;
    }

    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBS2PQDQqbsmu-UE0iUGaUMqEf7XkKkIhs",
        authDomain: "tripsync-ddbf5.firebaseapp.com",
        projectId: "tripsync-ddbf5",
        storageBucket: "tripsync-ddbf5.appspot.com",
        messagingSenderId: "182845026212",
        appId: "1:182845026212:web:37dfb3ee10f6e05b88a5a0",
        measurementId: "G-LHL5F9CNSM"
    };

    // Initialize Firebase (only if not already initialized)
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase initialized with TripSync project");
    } else {
        console.log("✅ Firebase already initialized");
    }

    // Get Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();

    // Set LOCAL persistence (no top-level await)
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            console.log("✅ Firebase persistence set to LOCAL");
        })
        .catch((error) => {
            console.error("Failed to set persistence:", error);
        });

    // One-time "auth is initialized" promise
    window.authReady = new Promise((resolve) => {
        let resolved = false;
        auth.onAuthStateChanged(() => {
            if (!resolved) { 
                resolved = true; 
                console.log("🔐 Firebase auth ready");
                resolve(); 
            }
        });
    });

    // Make services globally available
    window.firebaseAuth = auth;
    window.firebaseDB = db;
    window.firebaseStorage = storage;

    console.log("✅ Firebase configuration complete - use window.authReady.then() to ensure auth is ready");
})();