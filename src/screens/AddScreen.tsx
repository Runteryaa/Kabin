import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/dbInterface';

export default function AddScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Sınır Aşıldı', 'En fazla 5 fotoğraf ekleyebilirsiniz.');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf eklemek için galeri iznine ihtiyacımız var.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - images.length,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map(asset => `data:image/jpeg;base64,${asset.base64}`);
      setImages(prev => [...prev, ...selectedImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadToImgBB = async (base64Image: string) => {
    const apiKey = process.env.EXPO_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error('ImgBB API Key eksik. Lütfen .env dosyasına EXPO_PUBLIC_IMGBB_API_KEY ekleyin.');
    }
    
    // ImgBB base64 datasının başındaki 'data:image/jpeg;base64,' kısmını istemez
    const base64Data = base64Image.split(',')[1];
    
    const formData = new FormData();
    formData.append('image', base64Data);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error.message || 'Fotoğraf yüklenemedi.');
    }
  };

  const handleSubmit = async () => {
    if (!title || !price || !description || images.length === 0) {
      Alert.alert('Eksik Bilgi', 'Lütfen başlık, fiyat, açıklama ve en az 1 fotoğraf ekleyin.');
      return;
    }

    setLoading(true);
    try {
      // 1. Resimleri ImgBB'ye yükle
      const uploadedUrls = await Promise.all(images.map(img => uploadToImgBB(img)));

      // 2. Supabase'e ilan kaydet
      const { data, error } = await supabase.from('listings').insert([
        {
          title,
          description,
          price: price.toString(),
          location: location || 'Türkiye',
          category: category || 'Diğer',
          image_url: uploadedUrls[0], // Ana resim (HomeScreen için)
          image_urls: uploadedUrls, // Tüm resimler (DetailScreen için)
          user_id: user?.id,
          rating: 'Yeni'
        }
      ]);

      if (error) {
        throw new Error(error.message);
      }

      Alert.alert('Başarılı', 'İlanınız başarıyla eklendi!', [
        { text: 'Tamam', onPress: () => {
          // Formu temizle
          setImages([]);
          setTitle('');
          setDescription('');
          setPrice('');
          setLocation('');
          setCategory('');
          navigation.navigate('Home');
        }}
      ]);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İlan eklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="lock-closed-outline" size={64} color="#ccc" style={{ marginBottom: 16 }} />
          <Text style={styles.infoText}>İlan vermek için giriş yapmalısınız.</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Giriş Yap / Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yeni İlan Ekle</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Fotoğraf Ekleme Alanı */}
        <View style={styles.section}>
          <Text style={styles.label}>Fotoğraflar ({images.length}/5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.previewImage} />
                <TouchableOpacity style={styles.deleteImageBtn} onPress={() => removeImage(index)}>
                  <Ionicons name="close" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                <Ionicons name="camera-outline" size={32} color="#888" />
                <Text style={styles.addImageText}>Fotoğraf Ekle</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Form Alanı */}
        <View style={styles.section}>
          <Text style={styles.label}>İlan Başlığı</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Örn: Sıfır ayarında iPhone 13" 
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />

          <Text style={styles.label}>Fiyat (TL)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Örn: 25000" 
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Kategori</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Örn: Elektronik, Giyim vs." 
            value={category}
            onChangeText={setCategory}
          />

          <Text style={styles.label}>Konum</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Örn: Kadıköy, İstanbul" 
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Açıklama</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Ürününüzü detaylıca anlatın..." 
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Kaydet Butonu */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>İlanı Yayınla</Text>
          )}
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  content: {
    flex: 1,
    padding: 20,
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
  loginButton: {
    backgroundColor: '#E94560',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#222',
  },
  textArea: {
    minHeight: 100,
  },
  imageScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addImageText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontWeight: '500',
  },
  imageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  deleteImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#E94560',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  submitButton: {
    backgroundColor: '#1A1A2E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#777',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
