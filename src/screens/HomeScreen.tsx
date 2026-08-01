import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/dbInterface';

const { width } = Dimensions.get('window');
// Airbnb tarzı mobilde genelde tek satırda büyük görsel (veya yan yana 2)
const numColumns = Platform.OS === 'web' && width > 768 ? 4 : 1;

export default function HomeScreen() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch hatası:', error.message);
      } else {
        setListings(data || []);
      }
    } catch (err) {
      console.error('Veri çekilirken hata:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&w=800&q=80' }} 
          style={styles.cardImage} 
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.titleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'İlan Başlığı'}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#1A1A2E" />
            <Text style={styles.ratingText}>{item.rating || 'Yeni'}</Text>
          </View>
        </View>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{item.location || 'Konum Belirtilmemiş'}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>{item.category || 'Kategori'}</Text>
        <Text style={styles.cardPrice}>
          <Text style={styles.priceBold}>{item.price ? `${item.price} TL` : 'Fiyat Belirtilmemiş'}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#FFF" />
      
      {/* Header (Search Bar style like Airbnb) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.searchBar} activeOpacity={0.8}>
          <Ionicons name="search" size={20} color="#1A1A2E" style={styles.searchIcon} />
          <View>
            <Text style={styles.searchTitle}>Kabin'de Arayın</Text>
            <Text style={styles.searchSubtitle}>İstediğiniz her şey, komisyonsuz.</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      <View style={styles.listContainer}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#E94560" />
          </View>
        ) : listings.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Henüz hiç ilan yok.</Text>
            <Text style={styles.emptySubText}>İlk ilanı sen ekle!</Text>
          </View>
        ) : (
          <FlatList
            data={listings}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            numColumns={numColumns}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E94560" />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 15,
  },
  searchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  searchSubtitle: {
    fontSize: 12,
    color: '#717171',
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#717171',
    marginTop: 8,
  },
  flatListContent: {
    paddingBottom: 40,
  },
  card: {
    flex: 1,
    marginBottom: 32,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  cardBody: {
    marginTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    flex: 1,
    marginRight: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#222',
    marginLeft: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#717171',
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 15,
    color: '#222',
    marginTop: 6,
  },
  priceBold: {
    fontWeight: '600',
  },
});
