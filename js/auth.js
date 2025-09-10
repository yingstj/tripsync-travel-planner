// js/auth.js

// Show login modal
function showLogin() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        // Try both methods for compatibility
        modal.style.display = 'block';
        modal.classList.add('active');
    }
}

// Hide login modal  
function hideLogin() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        // Try both methods for compatibility
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Show signup modal
function showSignup() {
    hideLogin();
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('active');
    }
}

// Hide signup modal
function hideSignup() {
    const modal = document.getElementById('signupModal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}

// Utility: wait until a user is signed in (popup, redirect, or email/pw)
function waitForNextAuthUser(timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
        const auth = firebase.auth();
        // If already signed in, resolve immediately
        if (auth.currentUser) return resolve(auth.currentUser);

        const off = auth.onAuthStateChanged(user => {
            if (user) { off(); resolve(user); }
        });
        setTimeout(() => { off(); reject(new Error('Timed out waiting for sign-in')); }, timeoutMs);
    });
}

// Require sign-in for starting a trip; after login, go to dashboard
async function startNewTrip() {
    try {
        const auth = firebase.auth();
        if (!auth.currentUser) {
            showLogin(); // Open the login modal
            await waitForNextAuthUser(); // resolves when user logs in via Google or Email/Password
        }
        try { localStorage.removeItem('demoMode'); } catch (_) {}
        window.location.href = 'dashboard.html';
    } catch (err) {
        console.error('Start New Trip failed:', err);
        const msg = err.message === 'Timed out waiting for sign-in' 
            ? 'Please sign in to start a trip.' 
            : 'Could not start a new trip. Please try again.';
        if (window.showNotification) {
            showNotification(msg, 'error');
        } else {
            alert(msg);
        }
    }
}

// Login function
function login(event) {
    // Prevent form submission if called from a form
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    // Get the button that was clicked
    const loginBtn = event && event.target ? event.target : document.querySelector('#loginModal button[onclick*="login"]');
    const originalText = loginBtn.textContent;
    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;
    
    // Check if Firebase is configured
    if (typeof firebase !== 'undefined' && firebase.auth) {
        // Use Firebase authentication
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in successfully
                localStorage.setItem('userToken', userCredential.user.uid);
                localStorage.setItem('userEmail', email);
                localStorage.removeItem('demoMode');
                showNotification('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            })
            .catch((error) => {
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
                
                // Enhanced error logging for debugging (without sensitive data)
                console.error('Auth error', {
                    code: error.code,
                    message: error.message
                });
                
                // Handle specific error codes
                let errorMessage = 'Login failed';
                switch(error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email. Please sign up first.';
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password. Please try again.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address format.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This account has been disabled.';
                        break;
                    default:
                        errorMessage = error.message;
                }
                showNotification(errorMessage, 'error');
            });
    } else {
        // Demo mode - just save credentials locally
        localStorage.setItem('userToken', 'demo_token');
        localStorage.setItem('userEmail', email);
        localStorage.removeItem('demoMode');
        window.location.href = 'dashboard.html';
    }
}

// Signup function
function signup(event) {
    // Prevent form submission if called from a form
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const name = document.getElementById('signupName').value;
    
    // Validation
    if (!email || !password || !confirmPassword || !name) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Get the button that was clicked
    const signupBtn = event && event.target ? event.target : document.querySelector('#signupModal button[onclick*="signup"]');
    const originalText = signupBtn.textContent;
    signupBtn.textContent = 'Creating account...';
    signupBtn.disabled = true;
    
    // Create account with Firebase
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Update display name
                return userCredential.user.updateProfile({
                    displayName: name
                });
            })
            .then(() => {
                // Account created successfully
                const user = firebase.auth().currentUser;
                localStorage.setItem('userToken', user.uid);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', name);
                localStorage.removeItem('demoMode');
                
                // Save user data to Firestore
                if (firebase.firestore) {
                    firebase.firestore().collection('users').doc(user.uid).set({
                        name: name,
                        email: email,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
                
                showNotification('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            })
            .catch((error) => {
                signupBtn.textContent = originalText;
                signupBtn.disabled = false;
                
                // Handle specific error codes
                let errorMessage = 'Signup failed';
                switch(error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'An account with this email already exists.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address format.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak. Please use at least 6 characters.';
                        break;
                    default:
                        errorMessage = error.message;
                }
                showNotification(errorMessage, 'error');
            });
    } else {
        showNotification('Firebase is not configured. Please try demo mode.', 'error');
        signupBtn.textContent = originalText;
        signupBtn.disabled = false;
    }
}

// Google Sign In
function googleSignIn() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                // Signed in successfully
                const user = result.user;
                localStorage.setItem('userToken', user.uid);
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userName', user.displayName);
                localStorage.removeItem('demoMode');
                
                // Save user data to Firestore if new user
                if (firebase.firestore) {
                    firebase.firestore().collection('users').doc(user.uid).set({
                        name: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
                
                showNotification('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            })
            .catch((error) => {
                let errorMessage = 'Google sign-in failed';
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = 'Sign-in cancelled';
                } else if (error.code === 'auth/popup-blocked') {
                    errorMessage = 'Please allow popups for this site';
                } else {
                    errorMessage = error.message;
                }
                showNotification(errorMessage, 'error');
            });
    } else {
        showNotification('Google sign-in is not available. Please use email/password or demo mode.', 'error');
    }
}

// Logout function (for use in app.html)
function logout() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut();
    }
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('demoMode');
    window.location.href = 'index.html';
}

// Show notification
function showNotification(message, type = 'info') {
    console.log(`Notification (${type}): ${message}`);
    
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles based on type
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-size: 14px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        default:
            notification.style.background = '#3b82f6';
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add animation styles
document.addEventListener('DOMContentLoaded', function() {
    // Add animation styles if not already present
    if (!document.querySelector('#authAnimations')) {
        const style = document.createElement('style');
        style.id = 'authAnimations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Check auth state
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user && (window.location.pathname.includes('index.html') || window.location.pathname === '/')) {
                // User is signed in, redirect to dashboard
                console.log('User already signed in, redirecting to dashboard...');
                window.location.href = 'dashboard.html';
            }
        });
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    if (event.target == loginModal) {
        loginModal.classList.remove('active');
    }
    if (event.target == signupModal) {
        signupModal.classList.remove('active');
    }
}

// Log when script loads
console.log('Auth.js loaded successfully');
