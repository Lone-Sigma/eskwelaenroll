/**
 * portal_navigation.js
 * Handles navigation and form submission logic for the Enrollment Portal pages.
 * The Home and Features links redirect to placeholder functions (logging a message).
 */

// Function to handle clicks on conceptual pages (Home, Features, etc.)
function handleNavigation(pageName) {
    // In a real application, you would change the page content or redirect here.
    console.log(`Navigating to the '${pageName}' page. (Placeholder action)`);

    // For the 'Sign Up' link, we allow the href to handle the redirect to 'register.html'
    // but the following two demonstrate function calls for other navigation links.

    // Example redirection for Home:
    if (pageName === 'Home') {
        // Since we don't have a homepage, we just log it for now.
        // window.location.href = '/index.html'; 
    }
    
    // Example redirection for Features:
    if (pageName === 'Features') {
        // window.location.href = '/features.html'; 
    }
}

// Function to handle the login form submission
function handleLogin(event) {
    event.preventDefault(); // Stop the form from performing a traditional submission
    
    const form = document.getElementById('login-form');
    // Assuming the first input is Username and the second is Password
    const username = form.elements[0].value;
    const password = form.elements[1].value;

    console.log("--- Login Attempt ---");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password ? '********' : '[Empty]'}`);
    
    // Placeholder logic: Check if fields are filled
    if (username && password) {
        console.log("Login successful! Redirecting to dashboard...");
        // window.location.href = "/dashboard.html"; 
    } else {
        console.error("Login failed: Please enter both staff ID/username and password.");
    }
}

// Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Attach listeners for main navigation links
    document.getElementById('nav-home')?.addEventListener('click', (e) => {
        e.preventDefault();
        handleNavigation('Home');
    });

    document.getElementById('nav-features')?.addEventListener('click', (e) => {
        e.preventDefault();
        handleNavigation('Features');
    });

    document.getElementById('nav-support')?.addEventListener('click', (e) => {
        e.preventDefault();
        handleNavigation('Support');
    });

    document.getElementById('nav-about')?.addEventListener('click', (e) => {
        e.preventDefault();
        handleNavigation('About');
    });
    
    // Attach listener for the main login form submission
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
});
