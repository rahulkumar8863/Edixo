'use client';

import { firebaseConfig } from '@/firebase/config';

interface FirebaseServices {
  firebaseApp: any;
  auth: any;
  firestore: any;
  storage: any;
}

// Cache for Firebase services
let cachedServices: FirebaseServices | null = null;

// Export the interface for use in other modules
export type { FirebaseServices };

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export async function initializeFirebaseAsync(): Promise<FirebaseServices> {
  if (cachedServices) {
    return cachedServices;
  }

  // Dynamic import to ensure proper loading in Next.js client environment
  const firebaseAppModule = await import('firebase/app');
  const firebaseAuthModule = await import('firebase/auth');
  const firebaseFirestoreModule = await import('firebase/firestore');
  const firebaseStorageModule = await import('firebase/storage');

  // Firebase v9+ exports functions directly from the module namespace
  const initializeApp = (firebaseAppModule as any).initializeApp;
  const getApps = (firebaseAppModule as any).getApps;
  const getApp = (firebaseAppModule as any).getApp;
  const getAuth = (firebaseAuthModule as any).getAuth;
  const getFirestore = (firebaseFirestoreModule as any).getFirestore;
  const getStorage = (firebaseStorageModule as any).getStorage;

  let firebaseApp;

  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
    } catch (e) {
      // Only warn in production because it's normal to use the firebaseConfig to initialize
      // during development
      // @ts-ignore
      if (typeof process !== 'undefined' && process.env.NODE_ENV === "production") {
        console.warn('Automatic initialization failed. Falling back to firebase config object.', e);
      }
      firebaseApp = initializeApp(firebaseConfig);
    }
  } else {
    // If already initialized, return the SDKs with the already initialized App
    firebaseApp = getApp();
  }

  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  const storage = getStorage(firebaseApp);

  cachedServices = { firebaseApp, auth, firestore, storage };
  return cachedServices;
}

// Synchronous version for backward compatibility (will return cached services after first async init)
export function initializeFirebase(): FirebaseServices {
  if (!cachedServices) {
    throw new Error('Firebase not initialized. Use initializeFirebaseAsync() first or ensure FirebaseProvider is mounted.');
  }
  return cachedServices;
}

export function getSdks(firebaseApp: any): any {
  // This function is kept for compatibility but requires async init first
  throw new Error('getSdks is deprecated. Use initializeFirebaseAsync() instead.');
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
