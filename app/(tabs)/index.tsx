import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
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
}

const temasDestacados: Topics[] = [
  {
    id: 1,
    title: "Derivadas",
    description: "Domina las derivadas paso a paso, desde lo básico hasta técnicas avanzadas con ejemplos claros"
  },
  {
    id: 2,
    title: "Cálculo Integral",
    description: "Descubre cómo aplicar el cálculo integral con ejemplos prácticos y situaciones reales."
  },
  {
    id: 3,
    title: "Límites",
    description: "Aprende a calcular límites de funciones y comprender su comportamiento cerca de puntos específicos."
  },
  {
    id: 4,
    title: "Funciones Trigonométricas",
    description: "Explora las funciones trigonométricas y su aplicación en problemas de física y matemáticas."
  },
  {
    id: 5,
    title: "Ecuaciones Diferenciales",
    description: "Introducción a las ecuaciones diferenciales y métodos para resolverlas con ejemplos prácticos."
  }
];


export default function HomeScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

  const [text, setText] = useState('');

  useEffect(() => {
  const fetchVideos = async () => {
    try {
      const response = await fetch("https://math-gio-backend.onrender.com/videos/latest?n=5", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY?.trim() || ""
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error("Error al obtener videos:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchVideos();
}, []);


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.topContainer}>
        <ThemedText type="title" textColor="white">MATHGIO</ThemedText>
        <Image
          source={require('../../assets/images/Profile.jpg')}
          style={styles.image}
        />
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
            onChangeText={setText}
            placeholderTextColor="gray"
          />
        </View>
      </View>
      <ThemedText type="subtitleH2" textColor="black">Últimos videos</ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {videos.map((video) => (
          <TouchableOpacity
            key={video.id}
            onPress={() => Linking.openURL(video.url)}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: video.thumbnail }}
              style={styles.thumbnail}
              imageStyle={{ borderRadius: 12 }}
            >
              <LinearGradient
                colors={["rgba(0, 0, 0, 0.55)", "rgba(0, 0, 0, 0)"]}
                style={styles.gradient}
              />
              <Text style={styles.title} numberOfLines={2}>
                {video.title}
              </Text>
              <View style={styles.subTitleBox}>
                <Text style={styles.subTitle} numberOfLines={2}>
                  {video.duration}
                </Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ThemedText type="subtitleH2" textColor="black">Temas Destacados</ThemedText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {temasDestacados.map((tema) => (
          <View key={tema.id}>
            <View style={styles.topicCard}>
              <ThemedText type='defaultSemiBold' textColor='white'>{tema.title}</ThemedText>
              <ThemedText type='default' textColor='white'>{tema.description}</ThemedText>
              <TouchableOpacity style={styles.arrowButton} >
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
  topContainer: {
    backgroundColor: "#1d1d1d",
    alignSelf: 'stretch',
    flexDirection: "row",
    height: 170,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: { width: 70, height: 70, borderRadius: 100 },
  horizontalScroll: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 30
  },
  thumbnail: {
    width: 280,
    height: 160,
    justifyContent: "flex-start",
    borderRadius: 12,
    overflow: "hidden",
  },

  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  title: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
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
  icon: {

    color: "#FFFFFF",
  },
  input: {
    flex: 1,
    height: 40,
    color: '#000',
  },
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
