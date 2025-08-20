import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '@/models/Users';
import type { AuthResponse } from '@/models/AuthResponse';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  token: string;
  login: (auth: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  decodedToken: DecodedToken | null;
}

type DecodedToken = {
  [key: string]: any;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [logoutTimer, setLogoutTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    setUser(null);
    setToken('');
    setDecodedToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (logoutTimer) clearTimeout(logoutTimer);
    // navigate('/signin', { replace: true });
  };

  const fullLogout = () => {
    localStorage.clear();
    logout();
  };

  const scheduleLogout = (exp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const msUntilLogout = (exp - now) * 1000;
    if (msUntilLogout > 0) {
      const timer = setTimeout(() => {
        logout();
      }, msUntilLogout);
      setLogoutTimer(timer);
    } else {
      logout();
    }
  };

  useEffect(() => {
  if (!token && !loading) {
    navigate('/signin', { replace: true });
  }
}, [token, loading, navigate]);

  const login = (auth: AuthResponse) => {
    setUser(auth.user);
    setToken(auth.token);
    // console.log("auth.user:", auth.user);
    // console.log("auth.token:", auth.token);
    localStorage.setItem('token', auth.token);
    localStorage.setItem('user', JSON.stringify(auth.user));
    const decoded = jwtDecode(auth.token);
    setDecodedToken(decoded);
    console.log("decoded Token:", decoded);
    if (decoded.exp) {
      scheduleLogout(decoded.exp);
      localStorage.setItem('token_exp', decoded.exp.toString());
    }

    const selectedCompany = localStorage.getItem('selectedCompany');
    const selectedPeriod = localStorage.getItem('selectedPeriod');
    if (selectedCompany && selectedPeriod) {
      navigate('/dashboard/managment', { replace: true });
    } else {
      navigate('/select-company', { replace: true });
    }
  };

  const decodeToken = (token = localStorage.getItem('token')) => {
    if (token) {
      const decodedToken = jwtDecode(token);
      setDecodedToken(decodedToken);
    }
  };

  const showDecodeToken = (token = localStorage.getItem('token')) => {
    if (token) {
      const decodedToken = jwtDecode(token);
      console.log(decodedToken);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      setToken(token);
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
      const decoded: any = jwtDecode(token);
      setDecodedToken(decoded);
      if (decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) {
          logout();
          setLoading(false);
          return;
        }
        scheduleLogout(decoded.exp);
      }
    }
    setLoading(false); 
    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, []);

  useEffect(() => {
    (window as any).logout = logout;
    (window as any).showDecodeToken = showDecodeToken;
    (window as any).fullLogout = fullLogout;
  }, [logout, showDecodeToken, fullLogout]);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{
      user, token, login, logout, decodedToken, isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}