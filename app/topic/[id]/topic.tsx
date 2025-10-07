import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Tema = {
  id: number;
  title: string;
  description: string;
  indexNumber?: number | null;
  videoCount?: number | null;
  totalDuration?: number | null; // asumimos minutos
  createdAt?: string;
  updatedAt?: string;
};

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string; // texto (p.ej. "12:35")
  url: string;
};

export default function TemaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tema, setTema] = useState<Tema | null>(null);
  const [loadingTema, setLoadingTema] = useState(true);

  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [errorVideos, setErrorVideos] = useState<string | null>(null);

  const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";

  const formatMinutes = (mins?: number | null) => {
    if (mins == null) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h <= 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    // formato corto local
    return d.toLocaleDateString();
  };

  useEffect(() => {
    const fetchTema = async () => {
      try {
        setLoadingTema(true);
        const resp = await axios.get(
          `https://math-gio-backend.onrender.com/temas/${id}`,
          { headers: { "x-api-key": API_KEY } }
        );
        setTema(resp.data as Tema);
      } catch (e) {
        console.error(e);
        setTema(null);
      } finally {
        setLoadingTema(false);
      }
    };

    const fetchVideos = async () => {
      try {
        setLoadingVideos(true);
        setErrorVideos(null);
        const resp = await axios.get(
          `https://math-gio-backend.onrender.com/videos/by-tema/${id}`,
          { headers: { "x-api-key": API_KEY } }
        );
        const list = Array.isArray(resp.data) ? (resp.data as Video[]) : [];
        setVideos(list);
      } catch (e: any) {
        // Si backend devuelve 404 cuando no hay videos, tratamos como lista vacía
        const status = e?.response?.status;
        if (status === 404) {
          setVideos([]);
          setErrorVideos(null);
        } else {
          console.error(e);
          setVideos([]);
          setErrorVideos("No se pudieron cargar los videos.");
        }
      } finally {
        setLoadingVideos(false);
      }
    };

    if (id) {
      fetchTema();
      fetchVideos();
    }
  }, [id]);

  const headerTitle = useMemo(() => tema?.title ?? "Tema", [tema]);

  if (loadingTema) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: headerTitle }} />

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* ---------- Card de información del tema ---------- */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoTitle}>{tema?.title ?? "Tema"}</Text>
            <View style={styles.badgesRow}>
              <View style={styles.badgeDark}>
                <Text style={styles.badgeDarkText}>
                  {typeof tema?.indexNumber === "number" ? `Índice ${tema?.indexNumber}` : "Sin índice"}
                </Text>
              </View>
              <View style={styles.badgeDark}>
                <Text style={styles.badgeDarkText}>
                  {typeof tema?.videoCount === "number" ? `${tema?.videoCount} videos` : "Videos —"}
                </Text>
              </View>
              <View style={styles.badgeDark}>
                <Text style={styles.badgeDarkText}>
                  {formatMinutes(tema?.totalDuration)}
                </Text>
              </View>
            </View>
          </View>

          {!!tema?.description && (
            <View style={styles.infoBody}>
              <Text style={styles.infoDescription}>{tema.description}</Text>
            </View>
          )}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Creado: {formatDate(tema?.createdAt)}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaText}>Actualizado: {formatDate(tema?.updatedAt)}</Text>
          </View>
        </View>

        {/* ---------- Sección de videos ---------- */}
        <Text style={styles.sectionTitle}>Videos del tema</Text>

        {loadingVideos && (
          <View style={styles.sectionLoader}>
            <ActivityIndicator size="large" />
          </View>
        )}

        {!!errorVideos && !loadingVideos && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorVideos}</Text>
          </View>
        )}

        {!loadingVideos && !errorVideos && videos.length === 0 && (
          <Text style={styles.emptyText}>Este tema no tiene videos todavía.</Text>
        )}

        {!loadingVideos && !errorVideos && videos.length > 0 && (
          <View style={styles.videosGrid}>
            {videos.map((v) => (
              <TouchableOpacity
                key={v.id}
                activeOpacity={0.85}
                onPress={() => {
                  // Abrir en navegador/app de YouTube
                  // NOTE: si prefieres WebBrowser.openBrowserAsync, cámbialo aquí
                  // pero tu Home usa Linking.openURL en otras pantallas
                  // así que mantenemos consistencia:
                  // @ts-ignore
                  import("react-native").then(({ Linking }) => Linking.openURL(v.url));
                }}
              >
                <ImageBackground
                  source={{ uri: v.thumbnail }}
                  style={styles.thumbnail}
                  imageStyle={styles.thumbnailImage}
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0)"]}
                    style={styles.gradient}
                  />
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {v.title}
                  </Text>
                  <View style={styles.durationPill}>
                    <Text style={styles.durationText} numberOfLines={1}>
                      {v.duration}
                    </Text>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },

  /* ---------- Info Card ---------- */
  infoCard: {
    backgroundColor: "#1d1d1d",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 18,
  },
  infoHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  badgeDark: {
    backgroundColor: "#3b3b3b",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDarkText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  infoBody: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoDescription: {
    color: "#1d1d1d",
    fontSize: 16,
    lineHeight: 22,
  },
  metaRow: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaDot: {
    color: "#777",
  },
  metaText: {
    color: "#444",
    fontSize: 12,
  },

  /* ---------- Sección videos ---------- */
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  sectionLoader: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBox: {
    backgroundColor: "#FDECEC",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  errorText: {
    color: "#B00020",
    fontSize: 13,
  },
  emptyText: {
    color: "#1d1d1d",
    fontSize: 14,
  },

  videosGrid: {
    gap: 16,
  },
  thumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  thumbnailImage: {
    borderRadius: 12,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
  },
  videoTitle: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  durationPill: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#3b3b3b",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  durationText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
