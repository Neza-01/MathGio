import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ImageBackground, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../..//components/ThemedText';

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  url: string;
};

type Topic = {
  id: number;
  title: string;
  description: string;
};

export default function TabTwoScreen() {
  const [text, setText] = useState('');
  const [searching, setSearching] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [videosByTopic, setVideosByTopic] = useState<Record<number, Video[]>>({});
  const [loadingVideosByTopic, setLoadingVideosByTopic] = useState<Record<number, boolean>>({});
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [errorVideosByTopic, setErrorVideosByTopic] = useState<Record<number, string | null>>({});
  const router = useRouter();


  const API_KEY: string = process.env.EXPO_PUBLIC_API_KEY ?? '';

  const doSearch = async (value: string) => {
    
    if (!value || value.trim().length <= 1) {
      setTopics([]);
      setErrorSearch(null);
      return;
    }
    try {
      setSearching(true);
      setErrorSearch(null);
      const response = await axios.post(
        "https://math-gio-backend.onrender.com/temas/search",
        { value },
        { headers: { "x-api-key": API_KEY } }
      );
      setTopics(response.data);
      console.log(response.data)
    } catch (err: any) {
      console.error(`No se pudo obtener la información: ${err}`);
      setErrorSearch('No se pudo obtener los resultados. Intenta nuevamente.');
      setTopics([]);
    } finally {
      setSearching(false);
    }
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onChangeText = (val: string) => {
    setText(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (val.length > 1) {
        doSearch(val);
      } else {
        setTopics([]);
        setErrorSearch(null);
      }
    }, 250);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const toggleExpand = async (topicId: number) => {
    const next = new Set(expandedIds);
    if (next.has(topicId)) {
      next.delete(topicId);
      setExpandedIds(next);
      return;
    }
    next.add(topicId);
    setExpandedIds(next);

    if (videosByTopic[topicId]?.length) return;

    try {
      setLoadingVideosByTopic(prev => ({ ...prev, [topicId]: true }));
      setErrorVideosByTopic(prev => ({ ...prev, [topicId]: null }));

      const resp = await axios.get(
        `https://math-gio-backend.onrender.com/videos/by-tema/${topicId}`,
        { headers: { "x-api-key": API_KEY } }
      );

      const list = Array.isArray(resp.data) ? resp.data as Video[] : [];
      setVideosByTopic(prev => ({ ...prev, [topicId]: list }));
    } catch (err: any) {
      console.error(`No se pudieron obtener los videos para el tema ${topicId}: ${err}`);

      const status = err?.response?.status;
      if (status === 404) {
        setVideosByTopic(prev => ({ ...prev, [topicId]: [] }));
        setErrorVideosByTopic(prev => ({ ...prev, [topicId]: null }));
      } else {
        setErrorVideosByTopic(prev => ({ ...prev, [topicId]: 'No se pudieron cargar los videos.' }));
        setVideosByTopic(prev => ({ ...prev, [topicId]: [] }));
      }
    } finally {
      setLoadingVideosByTopic(prev => ({ ...prev, [topicId]: false }));
    }
  };

  const showPlaceholder = !searching && text.trim().length === 0 && topics.length === 0 && !errorSearch;

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
            placeholder="¿Qué tema quieres aprender hoy?"
            value={text}
            onChangeText={onChangeText}
            placeholderTextColor="gray"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </View>

      <ThemedText type="subtitleH2" textColor="black" style={{marginBottom: 20}}>Buscar Temas</ThemedText>

      {showPlaceholder && (
        <View style={styles.placeholder}>
          <Ionicons name="search-outline" size={90} color="#C5C5C5" />
          <ThemedText type="default" textColor="black" style={{ marginTop: 8 }}>
            Empieza a escribir para buscar temas
          </ThemedText>
        </View>
      )}

      {searching && (
        <View style={styles.globalLoader}>
          <ActivityIndicator size="large" />
          <ThemedText type="default" textColor="black">Buscando temas…</ThemedText>
        </View>
      )}

      {!!errorSearch && (
        <View style={styles.errorBox}>
          <Ionicons name="warning" size={18} color="#B00020" />
          <Text style={styles.errorText}>{errorSearch}</Text>
        </View>
      )}

      {(!searching && topics.length === 0 && text.length > 1 && !errorSearch) && (
        <ThemedText type="default" textColor="black" style={{ paddingHorizontal: 20 }}>
          No se encontraron temas para “{text}”.
        </ThemedText>
      )}

      {!searching && topics.length > 0 && (
        <View style={styles.resultsContainer}>
          {topics.map(topic => {
            const isOpen = expandedIds.has(topic.id);
            const videos = videosByTopic[topic.id] || [];
            const loadingVideos = !!loadingVideosByTopic[topic.id];
            const videosError = errorVideosByTopic[topic.id];

            return (
              <View key={topic.id} style={styles.topicCard}>
                {/* Encabezado del TEMA */}
                <TouchableOpacity
                  onPress={() => toggleExpand(topic.id)}
                  activeOpacity={0.8}
                  style={styles.topicHeader}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText type="defaultSemiBold" textColor="white" onPress={() => router.push({ pathname: '/topic/[id]/topic', params: { id: String(topic.id) } })}>{topic.title}</ThemedText>
                    {!!topic.description && (
                      <ThemedText type="default" textColor="white" numberOfLines={2}>
                        {topic.description}
                      </ThemedText>
                    )}
                  </View>
                  <Ionicons
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={22}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.topicBody}>
                    {/* Loader por tema */}
                    {loadingVideos && (
                      <View style={styles.sectionLoader}>
                        <ActivityIndicator size="large" />
                        <ThemedText type="default" textColor="black">Cargando videos…</ThemedText>
                      </View>
                    )}

                    {!!videosError && !loadingVideos && (
                      <View style={styles.errorBoxInner}>
                        <Ionicons name="warning" size={18} color="#B00020" />
                        <Text style={styles.errorText}>{videosError}</Text>
                      </View>
                    )}

                    {!loadingVideos && !videosError && videos.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScroll}
                      >
                        {videos.map(video => (
                          <TouchableOpacity
                            key={video.id}
                            onPress={() => Linking.openURL(video.url)}
                            activeOpacity={0.85}
                          >
                            <ImageBackground
                              source={{ uri: video.thumbnail }}
                              style={styles.thumbnail}
                              imageStyle={{ borderRadius: 12 }}
                            >
                              <LinearGradient
                                colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0)"]}
                                style={styles.gradient}
                              />
                              <Text style={styles.title} numberOfLines={2}>
                                {video.title}
                              </Text>
                              <View style={styles.subTitleBox}>
                                <Text style={styles.subTitle} numberOfLines={1}>
                                  {video.duration}
                                </Text>
                              </View>
                            </ImageBackground>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}

                    {!loadingVideos && !videosError && videos.length === 0 && (
                      <ThemedText type="default" textColor="black">
                        No hay videos asociados a este tema.
                      </ThemedText>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
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

  inputContainer: {
    marginTop: -38,
    width: "100%",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBlock: 20
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    borderRadius: 25,
    paddingHorizontal: 7,
    height: 50,
    width: "100%"
  },
  iconContainer: {
    marginRight: 10,
    backgroundColor: "#000000",
    borderRadius: 100,
    padding: 10
  },
  icon: { color: "#FFFFFF" },
  input: { flex: 1, height: 40, color: '#000' },

  placeholder: {
    marginTop: 24,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },

  globalLoader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },

  errorBox: {
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FDECEC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  errorBoxInner: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FDECEC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10
  },
  errorText: { color: '#B00020', fontSize: 13 },

  resultsContainer: {
    paddingHorizontal: 20,
    gap: 14
  },

  topicCard: {
    backgroundColor: "#1d1d1d",
    borderRadius: 16,
    overflow: 'hidden'
  },
  topicHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  topicBody: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8
  },

  sectionLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },

  horizontalScroll: {
    paddingVertical: 10,
    gap: 20
  },
  thumbnail: {
    width: 260,
    height: 150,
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
});
