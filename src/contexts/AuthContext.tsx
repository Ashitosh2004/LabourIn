import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "worker" | "employer";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  skills?: string[];
  wage?: number;
  experience?: string;
  available?: boolean;
  location?: { lat: number; lng: number };
  phone?: string;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (u: User) => {
    const snap = await getDoc(doc(db, "users", u.uid));
    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchProfile(u);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    // If profile doesn't exist (e.g. signup failed mid-way), create it
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) {
      const fallbackProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || email,
        role: "worker",
        displayName: cred.user.email?.split("@")[0] || "User",
        available: true,
        skills: [],
        createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", cred.user.uid), fallbackProfile);
      setProfile(fallbackProfile);
    }
  };

  const register = async (email: string, password: string, role: UserRole, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profileData: UserProfile = {
      uid: cred.user.uid,
      email,
      role,
      displayName,
      available: role === "worker",
      skills: [],
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), profileData);
    setProfile(profileData);
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
