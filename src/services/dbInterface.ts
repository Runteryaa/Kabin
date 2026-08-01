// Bu dosya, gelecekteki veritabanı geçişi (Supabase -> Oracle Autonomous Transaction DB)
// için hazırlanan örnek altyapı arayüzlerini içerir.
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  sendPhoneCode(phoneNumber: string, recaptchaVerifier: any): Promise<any>;
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
    console.log('Firebase üzerinden e-posta ile giriş yapılıyor...');
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { auth } = await import('./firebaseConfig');
    
    const userCredential = await signInWithEmailAndPassword(auth, email, passwordHash);
    const user = userCredential.user;
    
    // Doğrulama kontrolü (Kullanıcı e-posta linkine tıkladı mı?)
    if (!user.emailVerified) {
      throw new Error('Lütfen önce e-postanızı doğrulayın. E-posta kutunuza gelen linke tıklayın.');
    }
    
    return { id: user.uid, username: user.email || 'user', createdAt: new Date() };
  }
  
  async register(email: string, passwordHash: string): Promise<UserProfile> {
    console.log('Firebase üzerine e-posta ile kaydediliyor...');
    const { createUserWithEmailAndPassword, sendEmailVerification } = await import('firebase/auth');
    const { auth } = await import('./firebaseConfig');
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, passwordHash);
    const user = userCredential.user;
    
    // Firebase link gönderir (6 haneli kod değil)
    await sendEmailVerification(user);
    
    return { id: user.uid, username: user.email || 'user', createdAt: new Date() };
  }

  async verifyEmail(email: string, code: string): Promise<UserProfile> {
    // Firebase'de e-posta doğrulaması link ile yapılır, OTP kodu ile yapılmaz.
    // O yüzden bu fonksiyon Firebase kullanıldığında atlanır veya bilgi döner.
    console.log('Firebase e-posta doğrulaması için linke tıklanması gerekir.');
    throw new Error('E-posta doğrulama linki mail adresinize gönderildi. Lütfen mailinize giderek linke tıklayın.');
  }

  // Firebase Telefon Doğrulama
  async sendPhoneCode(phoneNumber: string, recaptchaVerifier: any): Promise<any> {
    const { signInWithPhoneNumber } = await import('firebase/auth');
    const { auth } = await import('./firebaseConfig');
    console.log(`${phoneNumber} numarasına SMS kodu gönderiliyor (Firebase)...`);
    
    // recaptchaVerifier Expo üzerinden LoginScreen'de oluşturulacak
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  }

  async verifyPhoneCode(confirmationResult: any, code: string): Promise<UserProfile> {
    console.log(`Kod ${code} ile telefon doğrulanıyor (Firebase)...`);
    
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    
    if (!user) throw new Error('Doğrulama başarısız oldu.');
    
    return { id: user.uid, username: user.phoneNumber || 'phone_user', createdAt: new Date() };
  }

  // Firebase Google Giriş
  async googleLogin(): Promise<UserProfile> {
    console.log('Google ile giriş yapılıyor...');
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
    const { auth } = await import('./firebaseConfig');

    // Sadece bir kere configure etmek yeterlidir ama burada her seferinde yapıyoruz (güvenli)
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    // Play servislerini kontrol et (Android için)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Google ile giriş penceresini aç
    const userInfo = await GoogleSignin.signIn();
    
    // idToken kullanarak Firebase Credential oluştur
    if (!userInfo.data?.idToken) {
      throw new Error("Google'dan idToken alınamadı.");
    }
    const googleCredential = GoogleAuthProvider.credential(userInfo.data.idToken);
    
    // Firebase auth'a credential'ı vererek giriş yap
    const userCredential = await signInWithCredential(auth, googleCredential);
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

  async sendPhoneCode(phoneNumber: string, recaptchaVerifier: any): Promise<any> {
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

