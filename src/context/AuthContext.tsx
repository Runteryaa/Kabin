import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { dbService, supabase } from '../services/dbInterface';

type User = {
  id: string;
  username: string;
};

type AuthContextData = {
  user: User | null;
  login: (email: string, passwordHash: string) => Promise<void>;
  register: (email: string, passwordHash: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  sendPhoneCode: (phoneNumber: string, recaptchaVerifier: any) => Promise<any>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Başlangıçta oturum kontrolü için true

  useEffect(() => {
    // Uygulama açıldığında mevcut oturumu kontrol et
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, username: session.user.email || '' });
      }
      setIsLoading(false);
    });

    // Oturum değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, username: session.user.email || '' });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, passwordHash: string) => {
    setIsLoading(true);
    try {
      await dbService.login(email, passwordHash);
    } catch (error: any) {
      console.warn('Giriş hatası:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, passwordHash: string) => {
    setIsLoading(true);
    try {
      await dbService.register(email, passwordHash);
      // Kayıt başarılı olduğunda kullanıcı durumu değişmez (Onay bekler)
    } catch (error: any) {
      console.warn('Kayıt hatası:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      await dbService.verifyEmail(email, code);
    } catch (error: any) {
      console.warn('Doğrulama hatası:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhoneCode = async (phoneNumber: string, recaptchaVerifier: any) => {
    setIsLoading(true);
    try {
      return await dbService.sendPhoneCode(phoneNumber, recaptchaVerifier);
    } catch (error: any) {
      console.warn('SMS gönderme hatası:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhoneCode = async (verificationId: string, code: string) => {
    setIsLoading(true);
    try {
      const dbUser = await dbService.verifyPhoneCode(verificationId, code);
      // Şimdilik simüle ettiğimiz için user state'i manuel ayarlıyoruz
      setUser({ id: dbUser.id, username: dbUser.username });
    } catch (error: any) {
      console.warn('Telefon doğrulama hatası:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async () => {
    setIsLoading(true);
    try {
      const dbUser = await dbService.googleLogin();
      setUser({ id: dbUser.id, username: dbUser.username });
    } catch (error: any) {
      console.warn('Google giriş hatası:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null); // Firebase/Mock çıkışı için de null yap
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, verifyEmail, 
      sendPhoneCode, verifyPhoneCode, googleLogin, 
      logout, isLoading 
    }}>
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
