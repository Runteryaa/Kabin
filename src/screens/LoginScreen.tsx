import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { firebaseConfig } from '../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [isLogin, setIsLogin] = useState(true);
  const [isOtpStep, setIsOtpStep] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  const recaptchaVerifier = useRef(null);
  
  const { login, register, verifyEmail, sendPhoneCode, verifyPhoneCode, googleLogin, isLoading } = useAuth();

  const handleAction = async () => {
    try {
      if (authMode === 'email') {
        if (!email || !password) return;
        if (isLogin) {
          await login(email, password);
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate('Home');
        } else {
          await register(email, password);
          Alert.alert('Kayıt Başarılı', 'Doğrulama linki e-postanıza gönderildi. Lütfen gelen kutunuzu kontrol edin ve linke tıklayın.');
          setIsLogin(true); // Giriş ekranına geri dön
        }
      } else {
        // Telefon Modu
        if (!phone) return;
        const formattedPhone = phone.startsWith('+') ? phone : `+90${phone}`;
        const result = await sendPhoneCode(formattedPhone, recaptchaVerifier.current);
        setConfirmationResult(result);
        setIsOtpStep(true);
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bir hata oluştu');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) return;
    try {
      await verifyPhoneCode(confirmationResult, otpCode);
      
      Alert.alert('Başarılı', 'Giriş başarılı!');
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Doğrulama Hatası', error.message || 'Geçersiz veya süresi dolmuş kod');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      Alert.alert('Google Girişi', 'Şu an simülasyon modunda. Gerçek kurulum için OAuth ayarları gerekir.');
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    }
  };

  if (isOtpStep) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Kabin</Text>
          <Text style={styles.subtitle}>Doğrulama Kodu</Text>
          <Text style={styles.infoText}>
            {phone} adresine gönderilen 6 haneli kodu girin.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Doğrulama Kodu (Örn: 123456)"
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
            maxLength={6}
          />
          
          <TouchableOpacity 
            style={[styles.button, (!otpCode) && styles.buttonDisabled]} 
            onPress={handleVerifyOtp}
            disabled={isLoading || !otpCode}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kodu Doğrula</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchModeButton} onPress={() => setIsOtpStep(false)}>
            <Text style={styles.switchModeText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={true}
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Kabin</Text>
          <Text style={styles.subtitle}>{isLogin ? 'Hesabınıza Giriş Yapın' : 'Yeni Hesap Oluşturun'}</Text>
        </View>

        <View style={styles.form}>
          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, authMode === 'email' && styles.activeTabButton]}
              onPress={() => setAuthMode('email')}
            >
              <Text style={[styles.tabText, authMode === 'email' && styles.activeTabText]}>E-posta</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, authMode === 'phone' && styles.activeTabButton]}
              onPress={() => setAuthMode('phone')}
            >
              <Text style={[styles.tabText, authMode === 'phone' && styles.activeTabText]}>Telefon</Text>
            </TouchableOpacity>
          </View>

          {authMode === 'email' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="E-posta Adresi"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Şifre (En az 6 karakter)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Telefon Numarası (Örn: 5551234567)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </>
          )}
          
          <TouchableOpacity 
            style={[styles.button, ((authMode === 'email' && (!email || !password)) || (authMode === 'phone' && !phone)) && styles.buttonDisabled]} 
            onPress={handleAction}
            disabled={isLoading || (authMode === 'email' ? (!email || !password) : !phone)}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? 'Devam Et' : 'Kayıt Ol'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>VEYA</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Ionicons name="logo-google" size={20} color="#444" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Google ile Devam Et</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchModeButton} 
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchModeText}>
              {isLogin ? 'Hesabın yok mu? Hemen Kayıt Ol' : 'Zaten hesabın var mı? Giriş Yap'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#E94560',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginTop: 10,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  activeTabText: {
    color: '#E94560',
  },
  input: {
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E1E5F2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#E94560',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonDisabled: {
    backgroundColor: '#FCA5B3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E1E5F2',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E1E5F2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '600',
  },
  switchModeButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchModeText: {
    color: '#E94560',
    fontSize: 14,
    fontWeight: '600',
  },
});
