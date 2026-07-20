// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCU7LIFlEg6Yf66OxSEVZHrK9EXzwOPyGw",
  authDomain: "telemetry-backend-5425a.firebaseapp.com",
  projectId: "telemetry-backend-5425a",
  storageBucket: "telemetry-backend-5425a.firebasestorage.app",
  messagingSenderId: "290397446862",
  appId: "1:290397446862:web:88c8b1d122dd319c1d269f",
  databaseURL: "https://telemetry-backend-5425a-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { getDatabase } from "firebase/database";

const db = getDatabase(app);
export { db };