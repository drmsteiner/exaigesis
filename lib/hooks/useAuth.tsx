"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserSource } from "@/lib/types/source";

/**
 * Built-in AI content sources that can be toggled
 */
export interface BuiltInSources {
  theBibleSays: boolean;
}

/**
 * User profile data stored in Firestore
 */
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: "user" | "moderator" | "admin";
  church?: string;
  denomination?: string;
  createdAt: Date;
  sermonCount: number;
  totalUpvotes: number;
  externalSources: UserSource[];
  builtInSources?: BuiltInSources;
}

/**
 * Auth context value
 */
interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Create a new user profile in Firestore
 */
async function createUserProfile(firebaseUser: User): Promise<UserProfile> {
  const newProfile: UserProfile = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || "Anonymous",
    email: firebaseUser.email || "",
    photoURL: firebaseUser.photoURL,
    role: "user",
    createdAt: new Date(),
    sermonCount: 0,
    totalUpvotes: 0,
    externalSources: [],
    builtInSources: {
      theBibleSays: true, // Enable by default for new users
    },
  };

  await setDoc(doc(db, "users", firebaseUser.uid), {
    ...newProfile,
    createdAt: serverTimestamp(),
  });

  return newProfile;
}

/**
 * Provider component that wraps the app and provides auth context
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const profileDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          } else {
            // Create profile if it doesn't exist (for Google sign-in)
            const newProfile = await createUserProfile(firebaseUser);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setError("Failed to load user profile");
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sign in with email and password
   */
  async function signIn(email: string, password: string) {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      setError(message);
      throw err;
    }
  }

  /**
   * Create a new account with email and password
   */
  async function signUp(email: string, password: string, displayName: string) {
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // Update display name in Firebase Auth
      await updateProfile(credential.user, { displayName });

      // Create user profile in Firestore
      await createUserProfile({
        ...credential.user,
        displayName,
      } as User);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      setError(message);
      throw err;
    }
  }

  /**
   * Sign in with Google
   */
  async function signInWithGoogle() {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in with Google";
      setError(message);
      throw err;
    }
  }

  /**
   * Sign out
   */
  async function signOut() {
    setError(null);
    try {
      await firebaseSignOut(auth);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign out";
      setError(message);
      throw err;
    }
  }

  /**
   * Send password reset email
   */
  async function resetPassword(email: string) {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
      throw err;
    }
  }

  /**
   * Update user profile in Firestore
   */
  async function updateUserProfile(data: Partial<UserProfile>) {
    if (!user) throw new Error("Not authenticated");

    setError(null);
    try {
      await setDoc(doc(db, "users", user.uid), data, { merge: true });
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
      throw err;
    }
  }

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
