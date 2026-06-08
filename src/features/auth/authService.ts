import { Capacitor } from '@capacitor/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { auth } from '../../firebase';
import type { AuthCredentials } from './authTypes';

export async function signUp({ email, password }: AuthCredentials) {
    return auth.createUserWithEmailAndPassword(email, password);
}

export async function signIn({ email, password }: AuthCredentials) {
    return auth.signInWithEmailAndPassword(email, password);
}

export async function signOut() {
    return auth.signOut();
}

export async function sendPasswordReset(email: string) {
    return auth.sendPasswordResetEmail(email);
}

export async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    if (Capacitor.isNativePlatform()) {
        await auth.signInWithRedirect(provider);
        return null;
    }

    return auth.signInWithPopup(provider);
}

export async function handleGoogleRedirectResult() {
    return auth.getRedirectResult();
}
