import { ProfileForm } from "@/components/ProfileForm";
import { StarField } from "@/components/StarField";
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const floatAnim = new Animated.Value(0);

  Animated.loop(
    Animated.sequence([
      Animated.timing(floatAnim, {
        toValue: -10,
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(floatAnim, {
        toValue: 10,
        duration: 2000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    ])
  ).start();

  return (
    <View style={styles.container}>
      <StarField />

      {/* Gradient Orbs */}
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Animated.Text style={[styles.logo, { transform: [{ translateY: floatAnim }] }]}>
            ☯
          </Animated.Text>
          <Text style={styles.title}>
            Flow<Text style={styles.titlePrimary}>Mind</Text>
          </Text>
          <Text style={styles.subtitle}>
            輸入你的出生資料{"\n"}
            <Text style={styles.subtitleHighlight}>開啟專屬於你的命理旅程</Text>
          </Text>
        </View>

        <View style={styles.formCard}>
          <ProfileForm />
        </View>

        <Text style={styles.privacy}>
          我們尊重您的隱私，資料僅用於命理分析
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    position: "relative",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    fontSize: 64,
    marginBottom: 12,
    color: "#FFD700",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
  },
  titlePrimary: {
    color: "#FFA500",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: "#AAAAAA",
    lineHeight: 24,
    maxWidth: 300,
  },
  subtitleHighlight: {
    color: "#FFA500AA",
  },
  formCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#55555550",
    backgroundColor: "#1f1f1f20",
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  privacy: {
    fontSize: 12,
    color: "#888888aa",
    marginTop: 24,
    textAlign: "center",
  },
  orbTop: {
    position: "absolute",
    top: 80,
    left: 40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FFA50020",
  },
  orbBottom: {
    position: "absolute",
    bottom: 80,
    right: 40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#FFA50010",
  },
});