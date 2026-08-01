// Bu dosya, gelecekteki veritabanı geçişi (Supabase -> Oracle Autonomous Transaction DB)
// için hazırlanan örnek altyapı arayüzlerini içerir.
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export interface UserProfile {
  id: string;
  username: string;
  createdAt: Date;
}

export interface IAuthRepository {
  login(email: string, passwordHash: string): Promise<UserProfile>;
  register(email: string, passwordHash: string): Promise<UserProfile>;
  verifyEmail(email: string, code: string): Promise<UserProfile>;
  // Yeni eklenen Firebase Telefon ve Google metodları
  sendPhoneCode(phoneNumber: string): Promise<any>;
  verifyPhoneCode(verificationId: string, code: string): Promise<UserProfile>;
  googleLogin(): Promise<UserProfile>;
}

// Supabase bağlantısı
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Firebase ve Supabase Entegrasyonu (Hibrit Mimari)
export class SupabaseRepository implements IAuthRepository {
  async login(email: string, passwordHash: string): Promise<UserProfile> {
    console.log('Native Firebase üzerinden e-posta ile giriş yapılıyor...');
    const userCredential = await auth().signInWithEmailAndPassword(email, passwordHash);
    const user = userCredential.user;
    
    // Doğrulama kontrolü (Kullanıcı e-posta linkine tıkladı mı?)
    if (!user.emailVerified) {
      throw new Error('Lütfen önce e-postanızı doğrulayın. E-posta kutunuza gelen linke tıklayın.');
    }
    
    return { id: user.uid, username: user.email || 'user', createdAt: new Date() };
  }
  
  async register(email: string, passwordHash: string): Promise<UserProfile> {
    console.log('Native Firebase üzerine e-posta ile kaydediliyor...');
    const userCredential = await auth().createUserWithEmailAndPassword(email, passwordHash);
    const user = userCredential.user;
    
    // Firebase link gönderir (6 haneli kod değil)
    await user.sendEmailVerification();
    
    return { id: user.uid, username: user.email || 'user', createdAt: new Date() };
  }

  async verifyEmail(email: string, code: string): Promise<UserProfile> {
    console.log('Firebase e-posta doğrulaması için linke tıklanması gerekir.');
    throw new Error('E-posta doğrulama linki mail adresinize gönderildi. Lütfen mailinize giderek linke tıklayın.');
  }

  // Firebase Telefon Doğrulama
  async sendPhoneCode(phoneNumber: string): Promise<any> {
    console.log(`${phoneNumber} numarasına SMS kodu gönderiliyor (Native Firebase)...`);
    
    // Native kütüphane otomatik recaptcha çözer (veya arkaplanda play integrity kullanır)
    const confirmationResult = await auth().signInWithPhoneNumber(phoneNumber);
    return confirmationResult;
  }

  async verifyPhoneCode(confirmationResult: any, code: string): Promise<UserProfile> {
    console.log(`Kod ${code} ile telefon doğrulanıyor (Native Firebase)...`);
    
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    
    if (!user) throw new Error('Doğrulama başarısız oldu.');
    
    return { id: user.uid, username: user.phoneNumber || 'phone_user', createdAt: new Date() };
  }

  // Firebase Google Giriş
  async googleLogin(): Promise<UserProfile> {
    console.log('Google ile giriş yapılıyor...');


    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    
    if (!userInfo.data?.idToken) {
      throw new Error("Google'dan idToken alınamadı.");
    }
    const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);
    
    const userCredential = await auth().signInWithCredential(googleCredential);
    const user = userCredential.user;

    return { id: user.uid, username: user.displayName || user.email || 'google_user', createdAt: new Date() };
  }
}

// İleride Oracle Autonomous DB'ye geçince kullanılacak sınıf
export class OracleTransactionDBRepository implements IAuthRepository {
  async login(email: string, passwordHash: string): Promise<UserProfile> {
    console.log('Oracle Autonomous Transaction DB üzerinden giriş yapılıyor...');
    return { id: 'oracle_123', username: email, createdAt: new Date() };
  }
  
  async register(email: string, passwordHash: string): Promise<UserProfile> {
    console.log('Oracle Autonomous Transaction DB üzerine kaydediliyor...');
    return { id: 'oracle_123', username: email, createdAt: new Date() };
  }

  async verifyEmail(email: string, code: string): Promise<UserProfile> {
    console.log('Oracle E-posta doğrulanıyor...');
    return { id: 'oracle_123', username: email, createdAt: new Date() };
  }

  async sendPhoneCode(phoneNumber: string): Promise<any> {
    return "fake_verification_id_12345";
  }

  async verifyPhoneCode(verificationId: string, code: string): Promise<UserProfile> {
    return { id: 'oracle_123', username: 'phone_user', createdAt: new Date() };
  }

  async googleLogin(): Promise<UserProfile> {
    return { id: 'oracle_123', username: 'google_user', createdAt: new Date() };
  }
}

// Projede kullanılacak güncel DB servisi (Oracle geçişinde sadece bu satır değişecek!)
export const dbService: IAuthRepository = new SupabaseRepository();

