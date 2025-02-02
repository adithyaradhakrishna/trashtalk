

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyDvyOipBSJ1_XhnFFEo5ckCk4awY40AlXk",

  authDomain: "thoughts-6fde7.firebaseapp.com",

  projectId: "thoughts-6fde7",

  storageBucket: "thoughts-6fde7.firebasestorage.app",

  messagingSenderId: "661469468331",

  appId: "1:661469468331:web:3cbde23bc88bd81f0049ee"

};
// Initialize Firebase app **before** exporting other services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; // Optional: Export the app instance if needed

