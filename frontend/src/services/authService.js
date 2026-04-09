import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../config/firebase';

/** Create a new user account */
export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

/** Sign in existing user */
export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

/** Sign out current user */
export const logOut = () => signOut(auth);

/** Send password reset email */
export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email);
