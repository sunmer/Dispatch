import { OAuthRedirectResult } from '@magic-ext/oauth';
import { MagicUserMetadata } from 'magic-sdk';
import { createContext, useContext, ReactNode, useState } from 'react';

interface AuthContextType {
  authData: null | {
    idToken: string;
    userMetadata: MagicUserMetadata;
    oauthRedirectResult: OAuthRedirectResult;
  };
  
  setAuthData: (data: any) => void;
  clearAuthData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const initialAuthData = localStorage.getItem('authData');
  const [authData, setAuthDataState] = useState<AuthContextType['authData']>(
    initialAuthData ? JSON.parse(initialAuthData) : null
  );

  const setAuthData = (data: any) => {
    localStorage.setItem('authData', JSON.stringify(data));
    setAuthDataState(data);
  };

  const clearAuthData = () => {
    localStorage.removeItem('authData');
    setAuthDataState(null);
  };

  return (
    <AuthContext.Provider value={{ authData, setAuthData, clearAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
