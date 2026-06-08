// src/firebase.ts
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';
import 'firebase/compat/storage';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();

// Configure persistence for Capacitor native apps
if (Capacitor.isNativePlatform()) {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((error) => {
        console.error('Error setting Firebase auth persistence:', error);
    });
}

export const db = firebase.firestore();
export const functions = firebase.app().functions('us-central1');
export const storage = firebase.storage();

// Uncomment this line when testing with local emulator
// functions.useEmulator('localhost', 5001);

export default firebase;
