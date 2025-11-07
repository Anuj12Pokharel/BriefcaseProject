import React, { createContext, useContext, useEffect, useState } from 'react';

type Role = 'admin' | 'signer';

type User = {
  email: string;
  role: Role;
};

type AuthContextValue = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('app_user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const login = async (email: string, _password: string) => {
    // NOTE: This is a client-side mock login. Replace with real API calls for production.
      // Test credentials (for local testing):
      // Updated dev/test credentials (local only)
      const SENDER_EMAIL = 'sender@ourbriefcase.com';
      const SENDER_PASS = 'ADMIN2468';
  const SIGNER_EMAIL = 'signer@ourbriefcase.com';
  const SIGNER_PASS = 'Password123';

    // infer role from email and validate password
    if (email === SENDER_EMAIL) {
      if (_password === SENDER_PASS) {
        const u: User = { email, role: 'admin' };
        setUser(u);
        localStorage.setItem('app_user', JSON.stringify(u));
        return;
      }
      throw new Error('Invalid sender credentials');
    }

    if (email === SIGNER_EMAIL) {
      if (_password === SIGNER_PASS) {
        const u: User = { email, role: 'signer' };
        setUser(u);
        localStorage.setItem('app_user', JSON.stringify(u));
        return;
      }
      throw new Error('Invalid signer credentials');
    }

    throw new Error('Unknown user');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export type { Role, User };
