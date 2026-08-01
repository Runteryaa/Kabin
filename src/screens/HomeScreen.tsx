import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const numColumns = Platform.OS === 'web' && width > 768 ? 4 : 2;

const MOCK_DATA = [
  { id: '1', title: 'Vintage Deri Ceket', price: '450 TL', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=400' },
  { id: '2', title: 'Beyaz Sneaker', price: '320 TL', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400' },
  { id: '3', title: 'Siyah Kumaş Pantolon', price: '210 TL', image: 'https://images.unsplash.com/photo-1594938298593-c53f06487e08?auto=format&fit=crop&q=80&w=400' },
  { id: '4', title: 'Retro Güneş Gözlüğü', price: '150 TL', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400' },
  { id: '5', title: 'Kanvas Çanta', price: '180 TL', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=400' },
  { id: '6', title: 'Desenli Gömlek', price: '250 TL', image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e23?auto=format&fit=crop&q=80&w=400' },
];

export default function HomeScreen() {
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardPrice}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="#F5F7FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>Kabin</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Bildirimler</Text>
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Adil Bir Pazar Yeri</Text>
        <Text style={styles.bannerText}>
          Dolap ve Gardrops'taki yüksek kesintilere inat, <Text style={styles.bannerHighlight}>Kabin'de komisyon her zaman sabit %10!</Text> Emeğinin karşılığını sen al.
        </Text>
      </View>

      {/* Product Grid */}
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Sana Özel Seçimler</Text>
        <FlatList
          data={MOCK_DATA}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.flatListContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1A1A2E',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#E94560',
    letterSpacing: 1,
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  banner: {
    backgroundColor: '#0F3460',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerTitle: {
    color: '#E94560',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
  },
  bannerHighlight: {
    fontWeight: 'bold',
    color: '#FFD700',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    maxWidth: Platform.OS === 'web' && width > 768 ? '23%' : '48%',
  },
  cardImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
});
