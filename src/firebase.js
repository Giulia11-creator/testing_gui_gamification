// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsyLzMRYMsqCaYK2Q-wE6x0lDHv0fYRvU",
  authDomain: "testapp2-addda.firebaseapp.com",
  projectId: "testapp2-addda",
  storageBucket: "testapp2-addda.firebasestorage.app",
  messagingSenderId: "873850905259",
  appId: "1:873850905259:web:1365df91f87729da2c0dee",
  measurementId: "G-BCNHXM34EK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;