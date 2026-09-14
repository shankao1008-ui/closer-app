import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAh2rhctjVQ7OY0Gi7nkhvbbF05ERjLgx0",
  authDomain: "closer-app-14e39.firebaseapp.com",
  projectId: "closer-app-14e39",
  storageBucket: "closer-app-14e39.firebasestorage.app",
  messagingSenderId: "677517267831",
  appId: "1:677517267831:web:fe1cd68106ab9ab9db0772",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);