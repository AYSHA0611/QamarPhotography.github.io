// --- Firebase Auth Setup ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


// Firebase Configuration - REPLACE WITH YOUR ACTUAL CONFIG FROM FIREBASE CONSOLE!
const firebaseConfig = {
    apiKey: "AIzaSyDOd87QfSwYZ_hGbBWes0JKdDsLRSvwXL8",
    authDomain: "qamar-45608.firebaseapp.com",
    projectId: "qamar-45608",
    storageBucket: "qamar-45608.appspot.com",
    messagingSenderId: "1054591832923",
    appId: "1:1054591832923:web:e6cf9c1feda4e019a6807e",
    measurementId: "G-20N9D9E7W9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Removed: No longer defining allowedDomain or allowedDomains as we want to allow any Google user.
// const allowedDomains = ["gmail.com", "yourcompany.com", "university.edu"]; // This line is removed.

// Removed: The global check that incorrectly used 'user' before it was defined.
/*
const domain = user.email.split("@")[1];
if (allowedDomain !== "yourdomain.com" && domain !== allowedDomain) {
    await signOut(auth);
    alert(`Access denied. Only ${allowedDomain} emails are allowed.`);
    return;
}
*/

// --- DOM Elements ---
const googleSignInBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const userInfo = document.getElementById("user-info");

const signInModal = document.getElementById("signInModal");
const modalSignInBtn = document.getElementById("modalSignInBtn");
const modalCloseBtn = document.getElementById("modalCloseBtn");

const galleryGrid = document.getElementById("gallery-grid");
const loadMoreBtn = document.getElementById("load-more-btn");
const showLessBtn = document.getElementById("show-less-btn");


// --- Firebase Auth Logic ---
if (googleSignInBtn) {
    googleSignInBtn.addEventListener("click", async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Removed: The domain check logic has been removed.
            /*
            const userEmailDomain = user.email ? user.email.split("@")[1] : null;
            const isDomainAllowed = userEmailDomain && allowedDomains.includes(userEmailDomain);

            if (!isDomainAllowed) {
                await signOut(auth);
                alert(`Access denied: Your email domain (${userEmailDomain || 'unknown'}) is not authorized for this application. Only specific domains are allowed.`);
                return;
            }
            */

            // Email verification check remains, as it's a separate security layer
            if (!user.emailVerified) {
                alert("Please verify your email to access this application.");
                try {
                    await sendEmailVerification(user);
                    alert("A verification email has been sent to your inbox. Please check it.");
                } catch (error) {
                    console.error("Error sending verification email:", error);
                    alert("Failed to send verification email. Please try again later.");
                }
                await signOut(auth); // Sign them out if email not verified
                return;
            }

            console.log("User signed in with Google:", user.displayName || user.email);
            alert("Welcome " + (user.displayName || user.email) + "!");
            window.location.href = "index.html";

        } catch (error) {
            console.error("Google Sign-In Error:", error.code, error.message);
            let errorMessage = "Login failed. Please try again.";
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = "Login window closed. Please try again.";
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = "Login already in progress. Please wait or try again.";
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = "An account with this email already exists using a different sign-in method. Please use that method.";
            } else if (error.code === 'auth/unauthorized-domain') {
                // This refers to domains authorized in Firebase Console -> Authentication -> Sign-in methods -> Google
                errorMessage = "This domain is not authorized for sign-in in Firebase settings. Please contact support.";
            }
            alert(errorMessage);
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        try {
            await signOut(auth);
            console.log("User signed out.");
            alert("You have been logged out.");
            window.location.href = "signin.html";
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Logout failed. Please try again.");
        }
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is currently signed in:", user.email);
        if (userInfo) userInfo.textContent = `Hi, ${user.displayName || user.email.split('@')[0]}`;
        if (googleSignInBtn) googleSignInBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";

        const navSignInLink = document.querySelector('nav a[href="signin.html"]');
        if (navSignInLink) {
            navSignInLink.textContent = "LOGOUT";
            navSignInLink.href = "#";
            const oldLogoutHandler = navSignInLink._logoutHandler;
            if (oldLogoutHandler) {
                navSignInLink.removeEventListener('click', oldLogoutHandler);
            }
            const newLogoutHandler = (event) => {
                event.preventDefault();
                signOut(auth).then(() => {
                    console.log("User signed out via nav link.");
                    window.location.href = "signin.html";
                }).catch(error => {
                    console.error("Logout from nav error:", error);
                    alert("Failed to logout from navigation.");
                });
            };
            navSignInLink.addEventListener('click', newLogoutHandler);
            navSignInLink._logoutHandler = newLogoutHandler;
        }

    } else {
        console.log("No user signed in.");
        if (userInfo) userInfo.textContent = "";
        if (googleSignInBtn) googleSignInBtn.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "none";

        const navLogoutLink = document.querySelector('nav a[href="#"]');
        if (navLogoutLink && navLogoutLink.textContent === "LOGOUT") {
            navLogoutLink.textContent = "SIGN IN";
            navLogoutLink.href = "signin.html";
            const oldLogoutHandler = navLogoutLink._logoutHandler;
            if (oldLogoutHandler) {
                navLogoutLink.removeEventListener('click', oldLogoutHandler);
                navLogoutLink._logoutHandler = null;
            }
        }
    }
});


// --- Modal Logic ---
function showSignInModal() {
    if (signInModal) {
        signInModal.classList.add("show");
    }
}

function hideSignInModal() {
    if (signInModal) {
        signInModal.classList.remove("show");
    }
}

if (modalSignInBtn) {
    modalSignInBtn.addEventListener("click", () => {
        hideSignInModal();
        window.location.href = "signin.html";
    });
}

if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", hideSignInModal);
}

if (signInModal) {
    signInModal.addEventListener("click", (e) => {
        if (e.target === signInModal) {
            hideSignInModal();
        }
    });
}


// --- Download Image Logic (helper function) ---
async function handleDownloadButtonClick(e) {
    e.preventDefault();
    const btn = e.currentTarget;
    const user = auth.currentUser;
    const imgSrc = btn.getAttribute("data-img");

    if (user) {
        if (!user.emailVerified) {
            alert("Please verify your email to download images.");
            try {
                await sendEmailVerification(user);
                alert("A verification email has been sent to your inbox. Please check it.");
            } catch (error) {
                console.error("Error sending verification email:", error);
                alert("Failed to send verification email. Please try again later.");
            }
            return;
        }

        const link = document.createElement("a");
        link.href = imgSrc;
        link.download = imgSrc.split("/").pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert("Download started!");

    } else {
        showSignInModal();
    }
}


// --- Gallery Load More/Show Less Logic ---
const allGalleryImages = [
    { src: "img17.jpeg", alt: "gallery image" },
    { src: "img18.jpeg", alt: "gallery image" },
    { src: "img19.jpeg", alt: "gallery image" },
    { src: "img20.jpeg", alt: "gallery image" },
    { src: "img21.jpeg", alt: "gallery image" },
    { src: "img22.jpeg", alt: "gallery image" },
    { src: "img23.jpeg", alt: "gallery image" },
    { src: "img24.jpeg", alt: "gallery image" },
    { src: "img28.jpeg", alt: "gallery image" },
    { src: "img26.jpeg", alt: "gallery image" },
    { src: "img27.jpeg", alt: "gallery image" },
    { src: "img29.jpeg", alt: "gallery image" },
    { src: "img30.jpeg", alt: "gallery image" },
    { src: "img31.jpeg", alt: "gallery image" },
    { src: "img32.jpeg", alt: "gallery image" },
    { src: "img33.jpeg", alt: "gallery image" },
    { src: "img34.jpeg", alt: "gallery image" },
    { src: "img35.jpeg", alt: "gallery image" },
    { src: "img36.jpeg", alt: "gallery image" },
    { src: "img37.jpeg", alt: "gallery image" },
    { src: "img38.jpeg", alt: "gallery image" },
    { src: "img39.jpeg", alt: "gallery image" },
    { src: "img40.jpeg", alt: "gallery image" },
    { src: "img41.jpeg", alt: "gallery image" },
    { src: "img42.jpeg", alt: "gallery image" },
    { src: "img43.jpeg", alt: "gallery image" },
    { src: "img44.jpeg", alt: "gallery image" },
    { src: "img45.jpeg", alt: "gallery image" },
    { src: "img46.jpeg", alt: "gallery image" },
    { src: "img47.jpeg", alt: "gallery image" },
    { src: "img48.jpeg", alt: "gallery image" },
    { src: "img49.jpeg", alt: "gallery image" },
    { src: "img50.jpeg", alt: "gallery image" },
    { src: "img51.jpeg", alt: "gallery image" },
    { src: "img52.jpeg", alt: "gallery image" },
    { src: "img53.jpeg", alt: "gallery image" },
    { src: "img54.jpeg", alt: "gallery image" },
    { src: "img55.jpeg", alt: "gallery image" },
    { src: "img56.jpeg", alt: "gallery image" },
    { src: "img57.jpeg", alt: "gallery image" },
    { src: "img58.jpeg", alt: "gallery image" },
    { src: "img59.jpeg", alt: "gallery image" },
    { src: "img60.jpeg", alt: "gallery image" },
    { src: "img61.jpeg", alt: "gallery image" },
    { src: "img62.jpeg", alt: "gallery image" },
    { src: "img63.jpeg", alt: "gallery image" },
    { src: "img64.jpeg", alt: "gallery image" },
    { src: "img65.jpeg", alt: "gallery image" },
    // Add more image objects here if you have them
];

const imagesToShowInitially = 8;
const imagesToLoadPerClick = 8;
let currentImageIndex = 0;

function renderGalleryImages(startIndex, count) {
    const endIndex = Math.min(startIndex + count, allGalleryImages.length);

    for (let i = startIndex; i < endIndex; i++) {
        const imageData = allGalleryImages[i];
        const galleryItem = document.createElement("div");
        galleryItem.classList.add("gallery__item");

        galleryItem.innerHTML = `
            <img src="${imageData.src}" alt="${imageData.alt}" />
            <button class="download-btn" data-img="${imageData.src}" title="Download">
                <i class="ri-download-2-line"></i>
            </button>
        `;
        galleryGrid.appendChild(galleryItem);

        const newDownloadBtn = galleryItem.querySelector(".download-btn");
        if (newDownloadBtn) {
            newDownloadBtn.addEventListener("click", handleDownloadButtonClick);
        }
    }

    currentImageIndex = endIndex;
    updateGalleryButtonVisibility();
}

function updateGalleryButtonVisibility() {
    if (!loadMoreBtn || !showLessBtn) return;

    if (currentImageIndex >= allGalleryImages.length) {
        loadMoreBtn.style.display = "none";
        if (allGalleryImages.length > imagesToShowInitially) {
            showLessBtn.style.display = "inline-block";
        } else {
            showLessBtn.style.display = "none";
        }
    } else {
        loadMoreBtn.style.display = "inline-block";
        showLessBtn.style.display = "none";
    }
}

if (galleryGrid) {
    galleryGrid.innerHTML = '';
    currentImageIndex = 0;
    renderGalleryImages(0, imagesToShowInitially);
}

if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
        renderGalleryImages(currentImageIndex, imagesToLoadPerClick);
    });
}

if (showLessBtn) {
    showLessBtn.addEventListener("click", () => {
        if (galleryGrid) {
            galleryGrid.innerHTML = '';
            currentImageIndex = 0;
            renderGalleryImages(0, imagesToShowInitially);
            updateGalleryButtonVisibility();
        }
    });
}


// --- ScrollReveal Setup ---
if (typeof ScrollReveal !== 'undefined') {
    const sr = ScrollReveal();

    sr.reveal(".hero__content", {
        origin: "top",
        interval: 100,
        distance: "50px",
        duration: 1000,
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
    });
    sr.reveal(".about__image, .about__text, .vision__item, .about__cta", {
        origin: "bottom",
        interval: 100,
        distance: "50px",
        duration: 1000,
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
    });
    sr.reveal(".service__card", {
        origin: "bottom",
        interval: 200,
        distance: "50px",
        duration: 1000,
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
    });
    sr.reveal(".gallery__grid .gallery__item", {
        origin: "bottom",
        interval: 50,
        distance: "50px",
        duration: 1000,
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
    });
    sr.reveal(".contact__info, .contact__form", {
        origin: "bottom",
        interval: 100,
        distance: "50px",
        duration: 1000,
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
    });
    sr.reveal(".signin__form__wrapper", {
        origin: "bottom",
        interval: 100,
        distance: "50px",
        duration: 1000,
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
    });

    sr.reveal(".about__container .section__header", {
        distance: "50px",
        origin: "bottom",
        duration: 1000,
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
    });
    sr.reveal(".about__container .section__description", {
        distance: "50px",
        origin: "bottom",
        duration: 1000,
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
        delay: 500,
    });
    sr.reveal(".about__container img", {
        distance: "50px",
        origin: "bottom",
        duration: 1000,
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
        delay: 1000,
    });

    sr.reveal(".service__container .section__header", {
        distance: "50px",
        origin: "bottom",
        duration: 1000,
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
    });
    sr.reveal(".service__container .section__description", {
        distance: "50px",
        origin: "bottom",
        duration: 1000,
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
        delay: 500,
    });
    sr.reveal(".service__card", {
        duration: 1000,
        delay: 800,
        interval: 200,
        distance: "50px",
        origin: "bottom",
        easing: "cubic-bezier(0.5, 0, 0, 1)",
        reset: false,
    });
} else {
    console.warn("ScrollReveal library not loaded. Animations will not work.");
    document.querySelectorAll('.section__container, .hero__content, .about__image, .about__text, .vision__item, .about__cta, .service__card, .gallery__item, .contact__info, .contact__form, .signin__form__wrapper').forEach(element => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    });
}
document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.getElementById("menu-btn");
    const navLinks = document.getElementById("nav-links");

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", function () {
            navLinks.classList.toggle("open");
        });

        navLinks.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("open");
            });
        });
    }
});