'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { firebaseService } from '@/firebase/services';
import type { User, UserSettings } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  updateUserData: (data: Partial<User>) => Promise<void>;
  updateSettings: (data: Partial<UserSettings>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_SETTINGS: UserSettings = {
  userId: '',
  currency: 'INR',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  defaultCategory: 'Other',
  defaultPaymentMethod: 'Cash',
  notifications: {
    budgetLimit: true,
    monthlySummary: true,
    savingsReminder: true,
    recurringPayment: true,
    goalAchievement: true,
    pushNotifications: false,
  },
  privacy: {
    showBalance: true,
    showAnalytics: true,
  },
  theme: 'system',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseService.auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const [data, userSettings] = await Promise.all([
            firebaseService.user.get(firebaseUser.uid),
            firebaseService.settings.get(firebaseUser.uid),
          ]);
          setUserData(data);
          setSettings(userSettings || { ...DEFAULT_SETTINGS, userId: firebaseUser.uid });
          try {
            const { processDueRules, checkAndGenerateMonthlySummary } = await import('@/utils/recurringProcessor');
            await processDueRules(firebaseUser.uid);
            await checkAndGenerateMonthlySummary(firebaseUser.uid);
          } catch (e) { console.warn('[Auth] Background processing failed', e); }
        } catch (e) {
          // User document might not exist yet
        }
      } else {
        setUserData(null);
        setSettings(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createUserDocument = useCallback(async (firebaseUser: FirebaseUser, name?: string) => {
    const userData: Partial<User> & Record<string, unknown> = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: name || firebaseUser.displayName || 'User',
      currency: 'INR',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    if (firebaseUser.photoURL) userData.photoURL = firebaseUser.photoURL;
    await firebaseService.user.create(firebaseUser.uid, userData);
    await firebaseService.settings.update(firebaseUser.uid, {
      ...DEFAULT_SETTINGS,
      userId: firebaseUser.uid,
    });
    setUserData(userData as User);
    setSettings({ ...DEFAULT_SETTINGS, userId: firebaseUser.uid });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await firebaseService.auth.login(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const cred = await firebaseService.auth.register(email, password);
      await createUserDocument(cred.user, name);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    }
  }, [createUserDocument]);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      const cred = await firebaseService.auth.loginWithGoogle();
      const existing = await firebaseService.user.get(cred.user.uid);
      if (!existing) {
        await createUserDocument(cred.user);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google login failed';
      setError(message);
      throw err;
    }
  }, [createUserDocument]);

  const logOut = useCallback(async () => {
    await firebaseService.auth.logout();
    setUser(null);
    setUserData(null);
    setSettings(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      await firebaseService.auth.resetPassword(email);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      throw err;
    }
  }, []);

  const verifyEmail = useCallback(async () => {
    setError(null);
    try {
      await firebaseService.auth.verifyEmail();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Email verification failed';
      setError(message);
      throw err;
    }
  }, []);

  const updateUserData = useCallback(async (data: Partial<User>) => {
    if (!user) return;
    try {
      await firebaseService.user.update(user.uid, data);
      setUserData((prev) => (prev ? { ...prev, ...data } : prev));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      setError(message);
      throw err;
    }
  }, [user]);

  const updateSettings = useCallback(async (data: Partial<UserSettings>) => {
    if (!user) return;
    try {
      await firebaseService.settings.update(user.uid, data);
      setSettings((prev) => (prev ? { ...prev, ...data } : prev));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Settings update failed';
      setError(message);
      throw err;
    }
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        settings,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        logOut,
        resetPassword,
        verifyEmail,
        updateUserData,
        updateSettings,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
