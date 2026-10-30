import { createContext, useContext, useState, PropsWithChildren } from 'react';

const STORAGE_KEY = 'rac-auth';
const AUTH_URL: string | undefined = import.meta.env.VITE_AUTH_URL;

export interface AuthUser {
  username: string;
  token?: string;
}

export class AuthError extends Error {
  constructor(public reason: 'invalid' | 'network') {
    super(reason);
  }
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadUser(): AuthUser | null {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore unavailable storage or malformed data
    }
  }
  return null;
}

function clearUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore unavailable storage
  }
}

// Without VITE_AUTH_URL there is no backend to check credentials against,
// so any non-empty login/password is accepted (local development only).
async function authenticate(username: string, password: string): Promise<AuthUser> {
  if (!AUTH_URL) return { username };

  let response: Response;
  try {
    response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new AuthError('network');
  }

  if (response.status === 401 || response.status === 403) {
    throw new AuthError('invalid');
  }
  if (!response.ok) {
    throw new AuthError('network');
  }

  const data = await response.json().catch(() => ({}));
  return { username: data.username ?? username, token: data.token };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);

  const login = async (username: string, password: string, remember: boolean) => {
    const authUser = await authenticate(username, password);
    clearUser();
    try {
      (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(authUser));
    } catch {
      // session still works in memory
    }
    setUser(authUser);
  };

  const logout = () => {
    clearUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
