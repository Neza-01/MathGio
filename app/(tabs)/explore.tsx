import { Image, StyleSheet, View, ScrollView, Text, ImageBackground, Linking, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';



export default function TabTwoScreen() {
  const [text, setText] = useState('');


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
        <ThemedText type="subtitleH2" textColor="black">Buscar Videos</ThemedText>
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
  boddy: { padding: 20 },
  horizontalScroll: {
    paddingVertical: 10,
    gap: 30
  },
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
  icon: {

    color: "#FFFFFF",
  },
  input: {
    flex: 1,
    height: 40,
    color: '#000',
  },
});
