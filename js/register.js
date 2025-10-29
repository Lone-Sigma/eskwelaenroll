// register.js

// Import the required functions from the correct modular SDK paths (using modern v9+ CDN style)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js"; 
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInAnonymously,
    signInWithCustomToken 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js"; // Realtime Database

// --- YOUR FIREBASE CONFIGURATION ---
const YOUR_FIREBASE_CONFIG = {
    apiKey: "AIzaSyBhkOB7czk7j2qqDiOpWGnlS0ICedOtOtk",
    authDomain: "eskwelaenroll.firebaseapp.com",
    projectId: "eskwelaenroll",
    storageBucket: "eskwelaenroll.firebasestorage.app",
    messagingSenderId: "20006672415",
    appId: "1:20006672415:web:667c119d184e7150429d2a",
    measurementId: "G-DNKL014SDS"
};

// =======================================================
// FIREBASE INITIALIZATION & HELPER FUNCTIONS
// =======================================================

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = YOUR_FIREBASE_CONFIG;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app;
let rtdb; 
let auth;

const messageBox = document.getElementById('message-box');

// UPDATED: showMessage function to handle the pop-up/flag behavior
function showMessage(message, isError = false) {
    // 1. Set content and styling
    messageBox.textContent = message;
    
    // Clear previous classes and set new ones
    messageBox.classList.remove('error-message', 'success-message', 'active'); 
    
    if (isError) {
        messageBox.classList.add('error-message');
        messageBox.style.color = 'var(--danger)';
        messageBox.style.borderColor = 'var(--danger)';
        messageBox.style.backgroundColor = '#fcebeb';
    } else {
        messageBox.classList.add('success-message');
        messageBox.style.color = 'var(--primary)';
        messageBox.style.borderColor = 'var(--primary)';
        messageBox.style.backgroundColor = '#e6f7ef';
    }

    // 2. Display the pop-up flag
    messageBox.style.display = 'block';
    // Add the 'active' class to trigger any CSS animations (e.g., slide-down)
    messageBox.classList.add('active'); 

    // 3. Auto-hide successful messages after 5 seconds
    if (!isError) {
        // Wait 5 seconds, then hide the message
        setTimeout(() => {
            hideMessage();
        }, 5000); 
    }
}

function hideMessage() {
    // Remove the 'active' class for the closing animation
    messageBox.classList.remove('active'); 
    // Wait for 500ms (the duration of the CSS transition) before setting display: none
    setTimeout(() => {
        messageBox.style.display = 'none';
        messageBox.textContent = ''; // Clear content
    }, 500); 
}

// Function to handle navigation
const handleNavigation = (target) => {
    if (target === "home") window.location.href = "index.html";
    if (target === "login") window.location.href = "login.html";
    if (target === "signup") window.location.href = "register.html";
};

// Exponential Backoff implementation
async function callApiWithBackoff(apiCall, maxRetries = 5, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
}

// =======================================================
// MAIN DOM CONTENT LOADED LOGIC
// =======================================================
document.addEventListener("DOMContentLoaded", async () => {
    // Setup Firebase
    if (Object.keys(firebaseConfig).length > 0) {
        app = initializeApp(firebaseConfig);
        rtdb = getDatabase(app); 
        auth = getAuth(app);
        
        try {
            // Initial Auth (Anonymous/Custom Token Sign-in for Read Access, if needed)
            if (initialAuthToken) {
                await callApiWithBackoff(() => signInWithCustomToken(auth, initialAuthToken));
            } else {
                await callApiWithBackoff(() => signInAnonymously(auth));
            }
            console.log("Firebase initialized and user authenticated.");
        } catch (error) {
            console.error("Firebase Auth initialization failed:", error);
            showMessage("Failed to initialize authentication service. Please check your connection.", true);
        }
    } else {
        console.error("Firebase configuration is missing.");
        showMessage("Application configuration error: Firebase is not configured.", true);
    }

    // Attach event listeners for navigation (prevent default link behavior)
    document.getElementById("logo-home").addEventListener("click", (e) => { e.preventDefault(); handleNavigation("home"); });
    document.getElementById("nav-home").addEventListener("click", (e) => { e.preventDefault(); handleNavigation("home"); });
    document.getElementById("btn-login").addEventListener("click", (e) => { e.preventDefault(); handleNavigation("login"); });
    document.getElementById("btn-signup").addEventListener("click", (e) => { e.preventDefault(); handleNavigation("signup"); });
    document.getElementById("link-login-header").addEventListener("click", (e) => { e.preventDefault(); handleNavigation("login"); });


    // --- SIGN UP FORM HANDLER ---
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();

        // Fetch form data
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const dob = document.getElementById('dob').value;
        const selectedRole = signupForm.querySelector('input[name="role"]:checked');
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const termsAccepted = document.getElementById('terms').checked;
        
        const registerButton = signupForm.querySelector('button');

        // --- VALIDATION ---
        if (!name || !email || !dob || !username || !password || !confirmPassword || !selectedRole || !termsAccepted) {
            showMessage("Please fill in all fields and agree to the terms.", true);
            return;
        }
        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", true);
            return;
        }
        if (password.length < 6) {
            showMessage("Password must be at least 6 characters long.", true);
            return;
        }
        // --- END VALIDATION ---

        registerButton.disabled = true;
        registerButton.textContent = 'Registering...';
        
        const role = selectedRole.value; // 'registrar', 'admin', or 'instructor'

        try {
            // 1. Create User in Firebase Authentication
            const userCredential = await callApiWithBackoff(() => createUserWithEmailAndPassword(auth, email, password));
            const user = userCredential.user;
            
            // 2. Store user data in Realtime Database, organized by role
            const userData = {
                uid: user.uid,
                email: user.email,
                fullName: name,
                username: username,
                dateOfBirth: dob,
                registrationDate: new Date().toISOString(),
                role: role
            };
            
            // Construct the path: /staff/{role}/{uid}
            const staffPath = `staff/${role}/${user.uid}`;
            
            await callApiWithBackoff(() => set(ref(rtdb, staffPath), userData));

            // SUCCESS MESSAGE
            showMessage(`Registration successful! Welcome, ${name}. Redirecting to dashboard...`);
            
            // Redirect after successful registration (2-second delay)
            setTimeout(() => {
                window.location.href = "adminview/dashboard.html"; 
            }, 2000);

        } catch (error) {
            console.error("Registration Error:", error);
            let errorMessage = "Registration failed. Please try again.";
            
            // Handle common Firebase errors
            if (error.code) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = "This email address is already in use.";
                        break;
                    case 'auth/invalid-email':
                        errorMessage = "The email address is invalid.";
                        break;
                    case 'auth/weak-password':
                        errorMessage = "The password is too weak. Please use a stronger password.";
                        break;
                    default:
                        errorMessage = `Registration Error: ${error.message.substring(0, 100)}...`;
                        break;
                }
            }
            // ERROR MESSAGE
            showMessage(errorMessage, true);

        } finally {
            registerButton.disabled = false;
            registerButton.innerHTML = '<i class="fas fa-user-plus"></i> Register Account';
        }
    });
});