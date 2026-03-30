// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_APIKEY,
authDomain: "place-mentor.firebaseapp.com",
  projectId: "place-mentor",
  storageBucket: "place-mentor.firebasestorage.app",
  messagingSenderId: "868795285790",
  appId: "1:868795285790:web:273f97bbf5de12b37a090f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
const provider=new GoogleAuthProvider()
export {provider,auth}
