import firebase from 'firebase/compat/app';

export type AuthUser = firebase.User;

export type AuthMode = 'signIn' | 'signUp';

export interface AuthCredentials {
    email: string;
    password: string;
}
