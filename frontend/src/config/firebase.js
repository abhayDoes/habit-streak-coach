import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAzzDMQW4U5Ls3PT8adnHxmdYGjDLG-s-k",
  authDomain: "basic-habit-tracker-9c0d1.firebaseapp.com",
  projectId: "basic-habit-tracker-9c0d1",
  storageBucket: "basic-habit-tracker-9c0d1.firebasestorage.app",
  messagingSenderId: "435437918903",
  appId: "1:435437918903:web:f62eac0ef233abebe34b32",
  measurementId: "G-295J1EMZTG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
