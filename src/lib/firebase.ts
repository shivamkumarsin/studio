
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// PASTE YOUR NEW FIREBASE PROJECT CONFIGURATION OBJECT HERE:
const firebaseConfig = {
  apiKey: "YOUR_NEW_API_KEY", // Replace with your new API Key
  authDomain: "YOUR_NEW_PROJECT_ID.firebaseapp.com", // Replace with your new authDomain
  projectId: "YOUR_NEW_PROJECT_ID", // Replace with your new projectId
  // IMPORTANT: This MUST be the name of the Cloud Storage bucket in your NEW Firebase project.
  // It's typically 'YOUR_NEW_PROJECT_ID.appspot.com'.
  // Verify this name in your new Firebase project's Storage settings or Google Cloud Console.
  storageBucket: "YOUR_NEW_PROJECT_ID.appspot.com", // Replace with your new storageBucket
  messagingSenderId: "YOUR_NEW_MESSAGING_SENDER_ID", // Replace with your new messagingSenderId
  appId: "YOUR_NEW_APP_ID", // Replace with your new appId
  measurementId: "YOUR_NEW_MEASUREMENT_ID" // Optional, replace if you have one
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
// The storageBucket from firebaseConfig will be used by default.
// If Firebase Storage was enabled correctly in a compatible region in your new project,
// this should connect to the default bucket.
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
