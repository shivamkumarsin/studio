
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
  // IMPORTANT: YOU MUST VERIFY THIS BUCKET NAME!
  // 1. Go to your Google Cloud Console: https://console.cloud.google.com/
  // 2. Select your project: "blog-website-amrit".
  // 3. Navigate to Cloud Storage -> Buckets.
  // 4. Find the bucket you created for Firebase Storage. COPY ITS EXACT NAME.
  // 5. PASTE THAT EXACT NAME as the value for 'storageBucket' below.
  //    The typical default Firebase creates is 'YOUR_PROJECT_ID.appspot.com'.
  //    If you manually created a bucket with a *different* name because of regional issues
  //    or because 'blog-website-amrit.appspot.com' was unavailable, you MUST use that custom name here.
  storageBucket: "blog-website-amrit.appspot.com", // <-- VERIFY THIS IS THE CORRECT NAME OF YOUR MANUALLY CREATED BUCKET
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
// This will use the storageBucket defined in firebaseConfig.
// It will only work AFTER you've successfully created that bucket in Google Cloud,
// set its CORS policy, AND ensured its name here EXACTLY matches the created bucket's name.
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

