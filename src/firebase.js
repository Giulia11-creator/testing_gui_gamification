// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBW2CDeH5437IwF3IbcdgT2T9Wt9q78Zyc",
  authDomain: "testapp-bd708.firebaseapp.com",
  projectId: "testapp-bd708",
  storageBucket: "testapp-bd708.firebasestorage.app",
  messagingSenderId: "77477343249",
  appId: "1:77477343249:web:e74cc147697d20401c41b0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;