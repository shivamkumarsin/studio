
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
  storageBucket: "blog-website-amrit.appspot.com", // STANDARD DEFAULT - USER MUST VERIFY THIS in Google Cloud Console > Storage > Buckets
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
const storage = getStorage(app); // This will use the storageBucket defined in firebaseConfig

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
