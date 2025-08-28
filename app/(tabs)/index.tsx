import { Image, StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
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

      <View style={styles.boddy}>
        <ThemedText type="subtitle" textColor="black">Últimos videos</ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40, // 👈 margen inferior extra para que se pueda hacer scroll hasta el final
  },
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
  image: {
    width: 60,
    height: 60,
    borderRadius: 100,
  },
  boddy: {
    padding: 20,
  }
});
