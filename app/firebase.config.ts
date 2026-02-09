// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBjo7LsDzIkio_mjDGAgewbwNtpll5gZ04",
  authDomain: "jamaat-tinder-test.firebaseapp.com",
  projectId: "jamaat-tinder-test",
  storageBucket: "jamaat-tinder-test.firebasestorage.app",
  messagingSenderId: "38541749069",
  appId: "1:38541749069:web:3552edc84718bd8f85e504",
  measurementId: "G-4HVFLHBH4P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and EXPORT Firestore
export const db = getFirestore(app);  // Has export!
console.log('Firebase initialized successfully!');

