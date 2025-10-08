import axios from "axios";
import { Stack } from "expo-router";
import React, { memo, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Tema = {
  id: number;
  title: string;
  description: string;
  indexNumber?: number | null;
  videoCount?: number | null;
  totalDuration?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  url: string;
  temaId?: number | null;
};

export default function AdminScreen() {
  const API_KEY = process.env.EXPO_PUBLIC_API_KEY ?? "";
  const [syncLoading, setSyncLoading] = useState(false);

  // Temas
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loadingTemas, setLoadingTemas] = useState(true);
  const [selectedTemaId, setSelectedTemaId] = useState<number | null>(null);

  // Crear tema
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Videos del tema seleccionado
  const [videosTema, setVideosTema] = useState<Video[]>([]);
  const [loadingVideosTema, setLoadingVideosTema] = useState(false);

  // Buscar videos para asignar
  const [q, setQ] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Video[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const selectedTema = useMemo(
    () => temas.find((t) => t.id === selectedTemaId) ?? null,
    [temas, selectedTemaId]
  );

  const toast = (msg: string) => Alert.alert("Admin", msg);

  // cargar temas
  const fetchTemas = async () => {
    try {
      setLoadingTemas(true);
      const resp = await axios.get("https://math-gio-backend.onrender.com/temas", {
        headers: { "x-api-key": API_KEY },
      });
      setTemas(resp.data);
      if (!selectedTemaId && resp.data?.length) setSelectedTemaId(resp.data[0].id);
    } catch (e) {
      console.error(e);
      toast("No se pudieron cargar los temas.");
    } finally {
      setLoadingTemas(false);
    }
  };

  const fetchVideosDeTema = async (temaId: number) => {
    try {
      setLoadingVideosTema(true);
      const resp = await axios.get(
        `https://math-gio-backend.onrender.com/videos/by-tema/${temaId}`,
        { headers: { "x-api-key": API_KEY } }
      );
      setVideosTema(Array.isArray(resp.data) ? resp.data : []);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        setVideosTema([]);
      } else {
        console.error(e);
        toast("No se pudieron cargar los videos del tema.");
      }
    } finally {
      setLoadingVideosTema(false);
    }
  };

  useEffect(() => {
    fetchTemas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTemaId != null) {
      fetchVideosDeTema(selectedTemaId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemaId]);

  // sync videos
  const handleSync = async () => {
    try {
      setSyncLoading(true);
      await axios.get("https://math-gio-backend.onrender.com/videos/sync", {
        headers: { "x-api-key": API_KEY },
      });
      toast("Sincronización iniciada/completada.");
      if (selectedTemaId != null) fetchVideosDeTema(selectedTemaId);
    } catch (e) {
      console.error(e);
      toast("No se pudo sincronizar.");
    } finally {
      setSyncLoading(false);
    }
  };

  // crear tema
  const handleCreateTema = async () => {
    const title = newTitle.trim();
    const description = newDesc.trim();
    if (!title) {
      toast("Título es obligatorio.");
      return;
    }
    try {
      await axios.post(
        "https://math-gio-backend.onrender.com/temas",
        { title, description },
        { headers: { "x-api-key": API_KEY } }
      );
      setNewTitle("");
      setNewDesc("");
      toast("Tema creado.");
      fetchTemas();
    } catch (e) {
      console.error(e);
      toast("No se pudo crear el tema.");
    }
  };

  // eliminar tema
  const handleDeleteTema = async () => {
    if (selectedTemaId == null) return;
    Alert.alert("Eliminar tema", "¿Seguro que deseas eliminar este tema?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(
              `https://math-gio-backend.onrender.com/temas/${selectedTemaId}`,
              { headers: { "x-api-key": API_KEY } }
            );
            toast("Tema eliminado.");
            setSelectedTemaId(null);
            fetchTemas();
            setVideosTema([]);
          } catch (e) {
            console.error(e);
            toast("No se pudo eliminar el tema.");
          }
        },
      },
    ]);
  };

  // buscar videos (no asignados por defecto)
  const handleSearch = async () => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    try {
      setSearching(true);
      setSearchError(null);
      const resp = await axios.post(
        "https://math-gio-backend.onrender.com/videos/search",
        { value: q.trim(), unassignedOnly: true, limit: 15 },
        { headers: { "x-api-key": API_KEY } }
      );
      setResults(Array.isArray(resp.data) ? resp.data : []);
    } catch (e) {
      console.error(e);
      setSearchError("Error al buscar videos.");
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  // asignar video -> tema
  const handleAssign = async (videoId: string) => {
    if (selectedTemaId == null) {
      toast("Selecciona un tema primero.");
      return;
    }
    try {
      await axios.patch(
        `https://math-gio-backend.onrender.com/videos/${videoId}/assign-tema`,
        { temaId: selectedTemaId },
        { headers: { "x-api-key": API_KEY } }
      );
      toast("Video asignado.");
      fetchVideosDeTema(selectedTemaId);
      setResults((prev) => prev.filter((v) => v.id !== videoId));
    } catch (e) {
      console.error(e);
      toast("No se pudo asignar el video.");
    }
  };

  // desasignar video
  const handleRemove = async (videoId: string) => {
    try {
      await axios.patch(
        `https://math-gio-backend.onrender.com/videos/${videoId}/remove-tema`,
        {},
        { headers: { "x-api-key": API_KEY } }
      );
      toast("Video desasignado.");
      if (selectedTemaId != null) fetchVideosDeTema(selectedTemaId);
    } catch (e) {
      console.error(e);
      toast("No se pudo desasignar el video.");
    }
  };

  // ----- UI -----
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Admin" }} />
      {/* Usamos ScrollView para evitar que se desmonte el árbol con cada letra */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
      >
        <Header
          temas={temas}
          loadingTemas={loadingTemas}
          selectedTemaId={selectedTemaId}
          setSelectedTemaId={setSelectedTemaId}
          selectedTema={selectedTema}
          videosTema={videosTema}
          loadingVideosTema={loadingVideosTema}
          q={q}
          setQ={setQ}
          results={results}
          searching={searching}
          searchError={searchError}
          newTitle={newTitle}
          setNewTitle={setNewTitle}
          newDesc={newDesc}
          setNewDesc={setNewDesc}
          handleSync={handleSync}
          handleCreateTema={handleCreateTema}
          handleDeleteTema={handleDeleteTema}
          handleSearch={handleSearch}
          handleAssign={handleAssign}
          handleRemove={handleRemove}
          syncLoading={syncLoading}
        />
      </ScrollView>
    </>
  );
}

// Header memoizado para minimizar renders
type HeaderProps = {
  temas: Tema[];
  loadingTemas: boolean;
  selectedTemaId: number | null;
  setSelectedTemaId: (id: number) => void;
  selectedTema: Tema | null;
  videosTema: Video[];
  loadingVideosTema: boolean;
  q: string;
  setQ: (v: string) => void;
  results: Video[];
  searching: boolean;
  searchError: string | null;
  newTitle: string;
  setNewTitle: (v: string) => void;
  newDesc: string;
  setNewDesc: (v: string) => void;
  handleSync: () => void;
  handleCreateTema: () => void;
  handleDeleteTema: () => void;
  handleSearch: () => void;
  handleAssign: (id: string) => void;
  handleRemove: (id: string) => void;
  syncLoading: boolean;
};

const Header = memo(function Header(props: HeaderProps) {
  const {
    temas,
    loadingTemas,
    selectedTemaId,
    setSelectedTemaId,
    selectedTema,
    videosTema,
    loadingVideosTema,
    q,
    setQ,
    results,
    searching,
    searchError,
    newTitle,
    setNewTitle,
    newDesc,
    setNewDesc,
    handleSync,
    handleCreateTema,
    handleDeleteTema,
    handleSearch,
    handleAssign,
    handleRemove,
    syncLoading,
  } = props;

  return (
    <View>
      {/* Actions */}
      <Text style={styles.sectionTitle}>Acciones</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSync} disabled={syncLoading}>
          {syncLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Sincronizar videos</Text>}
        </TouchableOpacity>
      </View>

      {/* Crear tema */}
      <Text style={styles.sectionTitle}>Crear Tema</Text>
      <View style={styles.card}>
        <View style={styles.inputsGroup}>
          <TextInput
            placeholder="Título"
            placeholderTextColor="#888"
            style={styles.input}
            value={newTitle}
            onChangeText={setNewTitle}
          />
          <TextInput
            placeholder="Descripción"
            placeholderTextColor="#888"
            style={[styles.input, styles.inputMultiline]}
            multiline
            value={newDesc}
            onChangeText={setNewDesc}
          />
        </View>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateTema}>
          <Text style={styles.primaryBtnText}>Crear</Text>
        </TouchableOpacity>
      </View>

      {/* Seleccionar tema */}
      <Text style={styles.sectionTitle}>Seleccionar Tema</Text>
      <View style={styles.card}>
        {loadingTemas ? (
          <ActivityIndicator />
        ) : (
          <>
            <FlatList
              data={temas}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.temasScroll}
              renderItem={({ item: t }) => (
                <TouchableOpacity
                  style={[styles.temaChip, selectedTemaId === t.id && styles.temaChipActive]}
                  onPress={() => setSelectedTemaId(t.id)}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[styles.temaChipText, selectedTemaId === t.id && styles.temaChipTextActive]}
                  >
                    {t.title}
                  </Text>
                </TouchableOpacity>
              )}
              // nota: no usamos removeClippedSubviews para no perder foco en inputs
            />

            <View style={styles.rowBetween}>
              <View style={styles.metaLeft}>
                <Text style={styles.meta} numberOfLines={1} ellipsizeMode="tail">
                  {selectedTema ? selectedTema.title : "—"}
                  {selectedTema?.videoCount != null ? ` · ${selectedTema.videoCount} videos` : ""}
                </Text>
              </View>
              {selectedTemaId != null && (
                <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteTema}>
                  <Text style={styles.dangerBtnText}>Eliminar tema</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      {/* Videos de este tema */}
      <Text style={styles.sectionTitle}>Videos del Tema</Text>
      <View style={styles.card}>
        {loadingVideosTema ? (
          <ActivityIndicator />
        ) : videosTema.length === 0 ? (
          <Text style={styles.muted}>Este tema no tiene videos.</Text>
        ) : (
          <FlatList
            data={videosTema}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.videoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.videoTitle} numberOfLines={1} ellipsizeMode="tail">
                    {item.title}
                  </Text>
                  <Text style={styles.videoMeta}>{item.duration}</Text>
                </View>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleRemove(item.id)}>
                  <Text style={styles.secondaryBtnText}>Desasignar</Text>
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            scrollEnabled={false} // el scroll grande lo maneja el ScrollView
          />
        )}
      </View>

      {/* Buscar videos para asignar */}
      <Text style={styles.sectionTitle}>Buscar Videos (no asignados)</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <TextInput
            placeholder="Buscar por título…"
            placeholderTextColor="#888"
            style={[styles.input, { flex: 1 }]}
            value={q}
            onChangeText={setQ}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSearch}>
            <Text style={styles.primaryBtnText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {searching && <ActivityIndicator style={{ marginTop: 10 }} />}

        {!!searchError && <Text style={[styles.muted, { color: "#B00020" }]}>{searchError}</Text>}

        {results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.videoRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.videoTitle} numberOfLines={1} ellipsizeMode="tail">
                    {item.title}
                  </Text>
                  <Text style={styles.videoMeta}>{item.duration}</Text>
                </View>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => handleAssign(item.id)}>
                  <Text style={styles.primaryBtnText}>Asignar</Text>
                </TouchableOpacity>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            style={{ marginTop: 10 }}
            scrollEnabled={false} // seguimos usando el scroll del ScrollView padre
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 },

  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#000", marginBottom: 8 },

  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },

  card: { backgroundColor: "#F7F7F7", borderRadius: 14, padding: 12, marginBottom: 16 },

  inputsGroup: {
    gap: 10,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    color: "#000",
  },
  inputMultiline: {
    height: 90,
    textAlignVertical: "top",
  },

  primaryBtn: {
    backgroundColor: "#1d1d1d",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },

  secondaryBtn: {
    backgroundColor: "#EAEAEA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  secondaryBtnText: { color: "#111", fontWeight: "700" },

  dangerBtn: { backgroundColor: "#B00020", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  dangerBtnText: { color: "#fff", fontWeight: "700" },

  temasScroll: { paddingVertical: 6, gap: 8 },
  temaChip: {
    backgroundColor: "#EAEAEA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    maxWidth: 240,
    marginRight: 8,
  },
  temaChipActive: { backgroundColor: "#1d1d1d" },
  temaChipText: { color: "#111", fontWeight: "700" },
  temaChipTextActive: { color: "#fff" },

  muted: { color: "#666" },
  metaLeft: { flex: 1, paddingRight: 8 },
  meta: { color: "#666", fontSize: 12 },

  videoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  videoTitle: { fontWeight: "700", color: "#000" },
  videoMeta: { color: "#666", marginTop: 2 },

  separator: { height: 10 },
});
