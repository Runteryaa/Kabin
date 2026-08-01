import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function FavoritesCartScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  
  // Şimdilik boş bir sepet state'i ile başlıyoruz.
  const [cartItems, setCartItems] = useState<any[]>([]);
  // Eğer sepette ürün varsa 'cart' sekmesi, yoksa 'favorites' sekmesi açılsın
  const [activeTab, setActiveTab] = useState<'favorites' | 'cart'>('favorites');

  useEffect(() => {
    if (cartItems.length > 0) {
      setActiveTab('cart');
    } else {
      setActiveTab('favorites');
    }
  }, [cartItems.length]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>Favorilerinizi veya sepetinizi görmek için giriş yapmalısınız.</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabHeader}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'favorites' && styles.activeTabButton]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'favorites' && styles.activeTabText]}>Favorilerim</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'cart' && styles.activeTabButton]}
          onPress={() => setActiveTab('cart')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'cart' && styles.activeTabText]}>
            Sepetim {cartItems.length > 0 ? `(${cartItems.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'favorites' ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>Henüz hiç favori ürününüz yok.</Text>
          </View>
        ) : (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>Sepetiniz şu an boş.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#E94560',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#888',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#E94560',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
