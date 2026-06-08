const AUTH_ERROR_MESSAGES: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/operation-not-allowed':
        'Email/password sign-in is not enabled. Try Google sign-in, or enable Email/Password in the Firebase Console under Authentication > Sign-in method.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/popup-blocked': 'Sign-in popup was blocked. Allow popups for this site and try again.',
    'auth/account-exists-with-different-credential':
        'An account already exists with this email using a different sign-in method.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

export function getAuthErrorMessage(error: unknown): string {
    const code = (error as { code?: string })?.code;
    if (code && AUTH_ERROR_MESSAGES[code]) {
        return AUTH_ERROR_MESSAGES[code];
    }
    return 'Something went wrong. Please try again.';
}
