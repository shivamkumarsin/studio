
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAApR4OBm5hLC6Q-urGmCwNStoX-hmgLcI", // User-provided API key
  authDomain: "blog-website-amrit.firebaseapp.com",
  projectId: "blog-website-amrit",
  // IMPORTANT: This MUST be the name of a Cloud Storage bucket that
  // 1. EXISTS in your Google Cloud project "blog-website-amrit".
  // 2. Is in a REGION COMPATIBLE with Firebase Storage (e.g., us-central1).
  // The standard name Firebase attempts to create is 'YOUR_PROJECT_ID.appspot.com'.
  // If you manually created a bucket with a *different* name, you MUST use that custom name here.
  // Verify this name in Google Cloud Console -> Cloud Storage -> Buckets.
  storageBucket: "blog-website-amrit.appspot.com",
  messagingSenderId: "708646374643",
  appId: "1:708646374643:web:4a8f52174b839c4e07bb86",
  measurementId: "G-Z11K61P6JX"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

// Attempt to connect to a specific storage bucket URL.
// This is a workaround if Firebase console shows a region error for Storage.
// This assumes 'blog-website-amrit.appspot.com' is the name of a bucket
// you have successfully created in a compatible region.
// If you created a bucket with a different name, update the URL below.
const storageBucketUrl = `gs://${firebaseConfig.storageBucket}`;
const storage = getStorage(app, storageBucketUrl);

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
