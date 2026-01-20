import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCnRyp7cAO0ek2LKBcnlfihsoANYQQKlM4",
  authDomain: "writehere-6280.firebaseapp.com",
  projectId: "writehere-6280",
  storageBucket: "writehere-6280.firebasestorage.app",
  messagingSenderId: "21533676201",
  appId: "1:21533676201:web:8246c55d78ee8febfccfb8"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app