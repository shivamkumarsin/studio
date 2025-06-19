
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2rJ-09fvNF6G36s8FoWyMqaEQpkCPOjI",
  authDomain: "amrit-website.firebaseapp.com",
  projectId: "amrit-website",
  storageBucket: "amrit-website.appspot.com", // Standard Firebase bucket name. Verify in your Firebase console.
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

// Initialize Firebase Storage.
// The storageBucket from firebaseConfig will be used.
// Ensure Firebase Storage is enabled in your new Firebase project and
// the bucket name matches (typically 'YOUR_PROJECT_ID.appspot.com').
const storage = getStorage(app);

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

export { app, db, storage, analytics };
