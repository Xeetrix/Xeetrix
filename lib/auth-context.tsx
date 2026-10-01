"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { UserRole, Agent } from "@/lib/types";

// Authorized primary administrator emails
const SUPER_ADMIN_EMAILS = [
  "contact.knltc@gmail.com",
  "admin@xeetrix.com",
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isAgent: boolean;
  agentProfile: Agent | null;
  userProfile: any | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: "CUSTOMER",
  isAdmin: false,
  isAgent: false,
  agentProfile: null,
  userProfile: null,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [agentProfile, setAgentProfile] = useState<Agent | null>(null);
  const [role, setRole] = useState<UserRole>("CUSTOMER");
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (currentUser: User) => {
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userDocRef);

      const isSuperAdminEmail = currentUser.email && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase());

      if (!snap.exists()) {
        const initialRole: UserRole = isSuperAdminEmail ? "SUPER_ADMIN" : "CUSTOMER";
        const initialData = {
          id: currentUser.uid,
          email: currentUser.email || "",
          displayName: currentUser.displayName || "",
          photoURL: currentUser.photoURL || "",
          role: initialRole,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, initialData);
        setUserProfile(initialData);
        setRole(initialRole);
      } else {
        const data = snap.data();
        let userRole: UserRole = data.role || (isSuperAdminEmail ? "SUPER_ADMIN" : "CUSTOMER");
        
        // Ensure super admin emails always retain SUPER_ADMIN role
        if (isSuperAdminEmail && userRole !== "SUPER_ADMIN") {
          userRole = "SUPER_ADMIN";
          await setDoc(userDocRef, { role: "SUPER_ADMIN" }, { merge: true });
        }

        setUserProfile(data);
        setRole(userRole);

        // If user is an agent, fetch agent profile
        if (userRole === "AGENT" || data.agentId) {
          const agentRef = doc(db, "agents", data.agentId || currentUser.uid);
          const agentSnap = await getDoc(agentRef);
          if (agentSnap.exists()) {
            setAgentProfile(agentSnap.data() as Agent);
          } else {
            // Also check by email
            const q = query(collection(db, "agents"), where("email", "==", currentUser.email));
            const qSnap = await getDocs(q);
            if (!qSnap.empty) {
              setAgentProfile(qSnap.docs[0].data() as Agent);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      // Fallback role for super admin
      if (currentUser.email && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase())) {
        setRole("SUPER_ADMIN");
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setUserProfile(null);
        setAgentProfile(null);
        setRole("CUSTOMER");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error("Email sign in error:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
      }
    } catch (error: any) {
      console.error("Email sign up error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN" || role === "BOOKING_STAFF" || role === "FINANCE_STAFF";
  const isAgent = role === "AGENT";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        isAdmin,
        isAgent,
        agentProfile,
        userProfile,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
