import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from 'react';
import { Image, ImageBackground, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  url: string
};

type Topics = {
  id: number;
  title: string;
  description: string
};

export default function HomeScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [temasDestacados, SetTemas] = useState<Topics[]>([]);
  const [searchResults, setSearchResults] = useState<Topics[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
  const [text, setText] = useState('');

  useEffect(() => {
    async function getVideos() {
      try {
        const response = await axios.get("https://math-gio-backend.onrender.com/videos/latest?n=10", {
          headers: { "x-api-key": API_KEY }
        });
        setVideos(response.data);
      } catch (err) {
        console.error(`No se pudo obtener la información: ${err}`);
      }
    }
    async function getTemas() {
      try {
        const response = await axios.get("https://math-gio-backend.onrender.com/temas/simple", {
          headers: { "x-api-key": API_KEY }
        });
        SetTemas(response.data);
      } catch (err) {
        console.error(`No se pudo obtener la información: ${err}`);
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* HEADER */}
      <View style={styles.topContainer}>
        <ThemedText type="title" textColor="white">MATHGIO</ThemedText>
        <Image source={require('../../assets/images/Profile.jpg')} style={styles.image} />
      </View>

      {/* INPUT */}
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
              if (nuevoTexto.length > 1) {
                search(nuevoTexto);
              } else {
                setSearchResults([]);
              }
            }}
            placeholderTextColor="gray"
          />
        </View>

        {/* DESPLEGABLE DE RESULTADOS */}
        {searchResults.length > 0 && (
          <View style={styles.dropdown}>
            <ScrollView nestedScrollEnabled={true}>
              {searchResults.map((tema) => (
                <TouchableOpacity
                  key={tema.id}
                  style={styles.resultItem}
                  onPress={() => {
                    setSearchResults([]); // Cierra el desplegable al elegir
                    Linking.openURL("https://youtube.com"); // 👈 cambia por URL real
                  }}
                >
                  <ThemedText type="defaultSemiBold" textColor="black">
                    {tema.title}
                  </ThemedText>
                  <ThemedText type="default" textColor="black">
                    {tema.description}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>


      {/* VIDEOS */}
      <ThemedText type="subtitleH2" textColor="black">Últimos videos</ThemedText>
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

      {/* TEMAS DESTACADOS */}
      <ThemedText type="subtitleH2" textColor="black">Temas Destacados</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        {temasDestacados.map((tema) => (
          <View>
            <View style={styles.topicCard}>
              <ThemedText type='defaultSemiBold' textColor='white'>{tema.title}</ThemedText>
              <ThemedText type='default' textColor='white'>{tema.description}</ThemedText>
              <TouchableOpacity style={styles.arrowButton}>
                <Ionicons name="arrow-forward" size={25} color="#1b1b1b" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 40 },

  /* HEADER */
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

  /* INPUT */
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
    top: 55, // justo debajo del input
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 200, // 👈 altura máxima scrollable
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
  }
});
