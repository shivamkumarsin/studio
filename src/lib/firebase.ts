
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
  // IMPORTANT: You likely encountered an error like "Your data location... no-cost Storage buckets".
  // This means you MUST MANUALLY CREATE a Cloud Storage bucket in your Google Cloud project.
  // 1. Go to Google Cloud Console -> Storage -> Buckets -> Create Bucket.
  // 2. Choose a compatible region (e.g., 'us-central1').
  // 3. TRY TO NAME THE BUCKET: 'blog-website-amrit.appspot.com'.
  //    If successful, the line below is correct.
  // 4. IF YOU CREATE A BUCKET WITH A DIFFERENT NAME (because 'blog-website-amrit.appspot.com' was taken or you chose another),
  //    YOU MUST UPDATE the 'storageBucket' value below to that EXACT new bucket name.
  // 5. After creating the bucket, you MUST set its CORS policy using 'gsutil' to allow uploads from your app.
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
// This will use the storageBucket defined in firebaseConfig.
// It will only work AFTER you've successfully created that bucket in Google Cloud and set its CORS policy.
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
