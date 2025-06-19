
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // Import getAuth
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB2rJ-09fvNF6G36s8FoWyMqaEQpkCPOjI",
  authDomain: "amrit-website.firebaseapp.com",
  projectId: "amrit-website",
  storageBucket: "amrit-website.firebasestorage.app",
  messagingSenderId: "356146249369",
  appId: "1:356146249369:web:3f09b6f869bb05e1ea8208",
  measurementId: "G-HCSLW22K9S"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app); // Initialize and export auth

// Initialize Firebase Analytics if supported
let analytics;
if (typeof window !== 'undefined') { // Ensure this code runs only in the browser
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(err => {
    console.error("Firebase Analytics initialization error:", err);
  });
}

export { app, db, storage, auth, analytics };
