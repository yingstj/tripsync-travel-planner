// firebase-config.js - TripSync Firebase Configuration
// App: tripsync (ID: 1:182845026212:web:6bc169761c3c36544cdb31)

(function () {
    // Check if Firebase is loaded
    if (!window.firebase || !firebase.auth) {
        console.error("Firebase not loaded - make sure Firebase scripts are loaded before this file");
        return;
    }

    // Your CORRECT Firebase configuration from Firebase Console
    const firebaseConfig = {
        apiKey: "AIzaSyDYnO9emO1K_PmLZM1QKKBFq11abS0O-fI",
        authDomain: "tripsync-ddbf5.firebaseapp.com",
        projectId: "tripsync-ddbf5",
        storageBucket: "tripsync-ddbf5.firebasestorage.app",
        messagingSenderId: "182845026212",
        appId: "1:182845026212:web:6bc169761c3c36544cdb31",
        measurementId: "G-3GKN7ZDRYN"
    };

    // Initialize Firebase
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase initialized with app: tripsync");
        } else {
            console.log("✅ Firebase already initialized");
        }

        // Get Firebase services
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();

        // Set persistence to LOCAL (stays logged in)
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                console.log("✅ Firebase persistence enabled");
            })
            .catch((error) => {
                console.error("Persistence error:", error);
            });

        // Make services globally available
        window.firebaseAuth = auth;
        window.firebaseDB = db;
        window.firebaseStorage = storage;

        // Wait for auth to be ready
        window.authReady = new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
                if (user) {
                    console.log("✅ User authenticated:", user.email);
                } else {
                    console.log("⚪ No user signed in");
                }
                unsubscribe();
                resolve();
            });
        });

        console.log("✅ Firebase ready - App ID:", firebaseConfig.appId);

    } catch (error) {
        console.error("Firebase initialization failed:", error);
        alert("Failed to initialize Firebase. Please check your internet connection and refresh.");
    }
})();
