import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; // Tambahan modul Auth

const firebaseConfig = {
  apiKey: "AIzaSyCNobjh5TYSLELbRo7jEFQTwEPI0osin6c",
  authDomain: "patriot-9da62.firebaseapp.com",
  databaseURL: "https://patriot-9da62-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "patriot-9da62",
  storageBucket: "patriot-9da62.firebasestorage.app",
  messagingSenderId: "1011962444878",
  appId: "1:1011962444878:web:a95d2c0fffaca92b22571f",
  measurementId: "G-XMZ63WE1DY"
};


const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app); // Export fungsi auth
