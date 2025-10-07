import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import retos from '../../assets/public/Retos';

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  url: string;
};

type Topics = {
  id: number;
  title: string;
  description: string;
};

type Reto = {
  id: number;
  titulo: string;
  descripcion: string;
  ejercicio?: string;
  url?: string;
};


export default function HomeScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [temasDestacados, setTemas] = useState<Topics[]>([]);
  const [searchResults, setSearchResults] = useState<Topics[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const ADMIN_CODE = process.env.EXPO_PUBLIC_ADMIN_CODE ?? '';
  const router = useRouter();

  // Reto del día (selección determinista no secuencial)
  const [reto, setReto] = useState<Reto>({ id: 0, titulo: 'Hola', descripcion: '' });

  const API_KEY: string = process.env.EXPO_PUBLIC_API_KEY ?? '';
  const [text, setText] = useState('');

  const [loadingVideos, setLoadingVideos] = useState<boolean>(true);
  const [loadingTemas, setLoadingTemas] = useState<boolean>(true);

  // ---- Selección diaria no secuencial (día*índice + sal y xorshift) ----
  const pickDailyIndex = (len: number, date: Date = new Date()): number => {
    if (len <= 0) return -1;
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate();

    let seed = ((d * 73856093) ^ (m * 19349663) ^ (y * 83492791)) >>> 0;

    seed ^= seed << 13; seed >>>= 0;
    seed ^= seed >> 17; seed >>>= 0;
    seed ^= seed << 5; seed >>>= 0;

    return seed % len;
  };

  function setRetoDiario() {
    const idx = pickDailyIndex(retos.length);
    if (idx >= 0) setReto(retos[idx] as Reto);
  }

  useEffect(() => {
    setRetoDiario();
  }, []);

  useEffect(() => {
    async function getVideos() {
      try {
        setLoadingVideos(true);
        const response = await axios.get(
          "https://math-gio-backend.onrender.com/videos/latest?n=10",
          { headers: { "x-api-key": API_KEY } }
        );
        setVideos(response.data);
      } catch (err) {
        console.error(`No se pudo obtener la información: ${err}`);
      } finally {
        setLoadingVideos(false);
      }
    }

    async function getTemas() {
      try {
        setLoadingTemas(true);
        const response = await axios.get(
          "https://math-gio-backend.onrender.com/temas/simple",
          { headers: { "x-api-key": API_KEY } }
        );
        setTemas(response.data);
      } catch (err) {
        console.error(`No se pudo obtener la información: ${err}`);
      } finally {
        setLoadingTemas(false);
      }
    }

    getVideos();
    getTemas();
  }, []);

  async function search(value: string) {
    try {
      const response = await axios.post(
        "https://math-gio-backend.onrender.com/temas/search",
        { value },
        { headers: { "x-api-key": API_KEY } }
      );
      setSearchResults(response.data);
      setIsModalVisible(true);
    } catch (err) {
      console.error(`No se pudo obtener la información: ${err}`);
    }
  }

  if (loadingVideos && loadingTemas) {
    return (
      <View style={styles.fullscreenLoader}>
        <ActivityIndicator size="large" />
        <ThemedText type="default" textColor="black">Cargando contenido…</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* HEADER */}
      <View style={styles.topContainer}>
        <ThemedText type="title" textColor="white">MATHGIO</ThemedText>
        <Image source={require('../../assets/images/Profile.jpg')} style={styles.image} />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <View style={styles.iconContainer}>
            <Ionicons name="search" size={20} color="gray" style={styles.icon} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="¿Qué quieres aprender hoy?"
            value={text}
            onChangeText={(nuevoTexto: string) => {
              setText(nuevoTexto);

              const normalized = nuevoTexto.trim();
              if (ADMIN_CODE && normalized === ADMIN_CODE) {
                setSearchResults([]);
                setIsModalVisible(false);
                router.push('/admin');
                return;
              }
              if (nuevoTexto.length > 1) {
                search(nuevoTexto);
              } else {
                setSearchResults([]);
                setIsModalVisible(false);
              }
            }}
            placeholderTextColor="gray"
          />
        </View>

        {searchResults.length > 0 && (
          <View style={styles.dropdown}>
            <ScrollView nestedScrollEnabled={true}>
              {searchResults.map((tema) => (
                <TouchableOpacity
                  key={tema.id}
                  style={styles.resultItem}
                  onPress={() => router.push({ pathname: '/topic/[id]/topic', params: { id: String(tema.id) } })}
                >
                  <ThemedText type="defaultSemiBold" textColor="black">
                    {tema.title}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <ThemedText type="subtitleH2" textColor="black">Últimos videos</ThemedText>
      {loadingVideos ? (
        <View style={styles.sectionLoader}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {videos.map((video) => (
            <TouchableOpacity key={video.id} onPress={() => Linking.openURL(video.url)} activeOpacity={0.8}>
              <ImageBackground source={{ uri: video.thumbnail }} style={styles.thumbnail} imageStyle={{ borderRadius: 12 }}>
                <LinearGradient colors={["rgba(0, 0, 0, 0.55)", "rgba(0, 0, 0, 0)"]} style={styles.gradient} />
                <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
                <View style={styles.subTitleBox}>
                  <Text style={styles.subTitle} numberOfLines={2}>{video.duration}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ThemedText type="subtitleH2" textColor="black">Temas Destacados</ThemedText>
      {loadingTemas ? (
        <View style={styles.sectionLoader}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {temasDestacados.map((tema: Topics) => (
            <View key={tema.id}>
              <View style={styles.topicCard}>
                <ThemedText type='defaultSemiBold' textColor='white'>{tema.title}</ThemedText>
                <ThemedText type='default' textColor='white'>{tema.description}</ThemedText>
                <TouchableOpacity style={styles.arrowButton}
                  onPress={() => router.push({ pathname: '/topic/[id]/topic', params: { id: String(tema.id) } })}>
                  <Ionicons name="arrow-forward" size={25} color="#1b1b1b" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <ThemedText type="subtitleH2" textColor="black">Reto Del Dia</ThemedText>
      <View style={{ paddingHorizontal: 20, marginTop: 6 }}>
        <View style={styles.challengeCard}>
          {/* Cabecera oscura */}
          <View style={styles.challengeHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText type="defaultSemiBold" textColor="white">
                {reto.titulo}
              </ThemedText>
              {!!reto.descripcion && (
                <ThemedText type="default" textColor="white" numberOfLines={2}>
                  {reto.descripcion}
                </ThemedText>
              )}
            </View>
            <Ionicons name="trophy" size={22} color="#FFFFFF" />
          </View>

          {/* Cuerpo blanco */}
          <View style={styles.challengeBody}>
            {!!reto.ejercicio && (
              <View style={{ gap: 6 }}>
                <Text style={{ color: '#1d1d1d', fontWeight: '700' }}>
                  Ejercicio:
                </Text>
                <Text style={{ color: '#1d1d1d' }}>
                  {reto.ejercicio}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 40 },

  fullscreenLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: '#FFFFFF'
  },

  sectionLoader: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },

  topContainer: {
    backgroundColor: "#1d1d1d",
    flexDirection: "row",
    height: 170,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: { width: 70, height: 70, borderRadius: 100 },

  inputContainer: {
    marginTop: -38,
    width: "100%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    borderRadius: 25,
    paddingHorizontal: 7,
    width: "100%",
    height: 50
  },
  iconContainer: {
    marginRight: 10,
    backgroundColor: "#000000",
    borderRadius: 100,
    padding: 10
  },
  icon: { color: "#FFFFFF" },
  input: { flex: 1, height: 40, color: '#000' },

  dropdown: {
    position: "absolute",
    top: 55,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd"
  },

  /* SCROLL */
  horizontalScroll: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 30
  },

  /* VIDEOS */
  thumbnail: {
    width: 280,
    height: 160,
    justifyContent: "flex-start",
    borderRadius: 12,
    overflow: "hidden",
  },
  gradient: { position: "absolute", top: 0, left: 0, right: 0, height: "50%" },
  title: { position: "absolute", top: 10, left: 10, right: 10, fontSize: 14, fontWeight: "bold", color: "#fff" },
  subTitle: { fontWeight: "bold", color: "#fff" },
  subTitleBox: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#3b3b3bff",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },

  /* TEMAS DESTACADOS */
  topicCard: {
    width: 180,
    minHeight: 250,
    backgroundColor: "#1d1d1d",
    padding: 10,
    borderRadius: 15
  },
  arrowButton: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    width: 30,
    height: 30,
    borderRadius: 100,
    bottom: 15,
    right: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },

  /* RETO DEL DÍA (estilo card de Temas) */
  challengeCard: {
    backgroundColor: "#1d1d1d",
    borderRadius: 16,
    overflow: 'hidden'
  },
  challengeHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  challengeBody: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12
  },
  ctaButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#1d1d1d',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700'
  },

});
