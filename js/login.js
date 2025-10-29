// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBhkOB7czk7j2qqDiOpWGnlS0ICedOtOtk",
  authDomain: "eskwelaenroll.firebaseapp.com",
  projectId: "eskwelaenroll",
  storageBucket: "eskwelaenroll.firebasestorage.app",
  messagingSenderId: "20006672415",
  appId: "1:20006672415:web:667c119d184e7150429d2a",
  measurementId: "G-DNKL014SDS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM elements
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.querySelector(".login-button");
const messageBox = document.getElementById("message-box");
const togglePassword = document.getElementById("toggle-password");

// Show/Hide password
togglePassword.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

// Remove placeholder when focused
[emailInput, passwordInput].forEach(input => {
  input.addEventListener("focus", () => input.setAttribute("placeholder", ""));
  input.addEventListener("blur", () => {
    if (input.id === "email") input.setAttribute("placeholder", "Enter your email address");
    else input.setAttribute("placeholder", "Enter your password");
  });
});

// Popup message
function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.style.display = "block";
  messageBox.className = type === "success" ? "success" : "error";
}

// Handle login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showMessage("Please enter both email and password.", "error");
    return;
  }

  // Change button text
  loginButton.disabled = true;
  loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showMessage("Login successful! Redirecting...", "success");

    setTimeout(() => {
      window.location.href = "adminview/dashboard.html";
    }, 2000);
  } catch (error) {
    console.error("Error:", error);
    let message = "Login failed. Please check your credentials.";
    if (error.code === "auth/invalid-email") message = "Invalid email format.";
    if (error.code === "auth/user-not-found") message = "No account found with this email.";
    if (error.code === "auth/wrong-password") message = "Incorrect password.";
    showMessage(message, "error");
  }

  // Reset button
  loginButton.disabled = false;
  loginButton.innerHTML = '<i class="fas fa-right-to-bracket"></i> Log In';
});
