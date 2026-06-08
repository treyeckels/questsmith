// src/firebase.ts
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';
import 'firebase/compat/storage';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
    apiKey: "AIzaSyBrTZJzh6kqjDuTdEwDX3qbJPJdF0QKM1c",
    authDomain: "quest-smith-2a276.firebaseapp.com",
    projectId: "quest-smith-2a276",
    storageBucket: "quest-smith-2a276.firebasestorage.app",
    messagingSenderId: "328488501565",
    appId: "1:328488501565:web:8fef585bc74cff8c828554",
    measurementId: "G-Q3MGN09RKZ"
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
export const functions = firebase.functions();
export const storage = firebase.storage();

// Uncomment this line when testing with local emulator
// functions.useEmulator('localhost', 5001);

export default firebase;
