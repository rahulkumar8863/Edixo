'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebaseAsync, type FirebaseServices } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Initialize Firebase on the client side, once per component mount.
    initializeFirebaseAsync()
      .then(services => {
        setFirebaseServices(services);
      })
      .catch(err => {
        console.error('Firebase initialization error:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Failed to initialize Firebase: {error.message}
      </div>
    );
  }

  if (!firebaseServices) {
    // Loading state while Firebase initializes
    return (
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      storage={firebaseServices.storage}
    >
      {children}
    </FirebaseProvider>
  );
}