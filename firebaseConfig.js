// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// You can remove analytics for this project

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwkq0WYepop4s-CT3xurnK1j3UMMhKsYw",
  authDomain: "my-firebase-app-3a3fc.firebaseapp.com",
  projectId: "my-firebase-app-3a3fc",
  storageBucket: "my-firebase-app-3a3fc.firebasestorage.app",
  messagingSenderId: "447289405426",
  appId: "1:447289405426:web:73f447dfc34c95ef16c56b",
  measurementId: "G-7RZS8KGG30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (this is what you need for CRUD)
const db = getFirestore(app);

// Export db so your App.jsx can use it
export { db };