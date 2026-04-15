import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkeM-lAFQDAm5PF2NCcPwimFNPJF8TFLs",
  authDomain: "labour-543c5.firebaseapp.com",
  projectId: "labour-543c5",
  storageBucket: "labour-543c5.firebasestorage.app",
  messagingSenderId: "283145849262",
  appId: "1:283145849262:web:ce4db5b0318a80b20b203f",
  measurementId: "G-324ZVTLSYK",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
