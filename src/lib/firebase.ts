
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChq9jz28OYnd3Qdr0SZhyluQduZXiBmVs",
  authDomain: "blog-website-amrit.firebaseapp.com",
  projectId: "blog-website-amrit",
  storageBucket: "blog-website-amrit.appspot.com", // Corrected to appspot.com domain for storage
  messagingSenderId: "708646374643",
  appId: "1:708646374643:web:4a8f52174b839c4e07bb86",
  measurementId: "G-Z11K61P6JX"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Firebase Analytics if supported
let analytics;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, storage, analytics };
