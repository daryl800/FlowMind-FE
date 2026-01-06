// app/fortune.tsx
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, Button, Easing, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFortune } from "../hooks/useFortune";

/* -----------------------------
   Helpers
------------------------------*/
const renderDots = (count: number) => "●".repeat(count || 0);
const fiveElementCN: Record<string, string> = { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" };
const getFiveElementSummary = (strength: Record<string, number>) => {
    const sorted = Object.entries(strength).sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];
    let summary = "";
    if (strongest) summary += `偏${fiveElementCN[strongest[0]]}`;
    if (sorted[1]) summary += fiveElementCN[sorted[1][0]];
    if (weakest && weakest[1] === 0) summary += `，${fiveElementCN[weakest[0]]}不足`;
    return summary;
};

/* -----------------------------
   Fortune Page
------------------------------*/
export default function Fortune() {
    const router = useRouter();
    const spinAnim = useRef(new Animated.Value(0)).current;

    // hook provides all state + fetch logic
    const { profile, bazi, yearOutlook, lucky, regional, amulet, loading, loadFortune } = useFortune();

    /* -----------------------------
       Spin Animation
    ------------------------------*/
    const startSpin = () => {
        Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 1200,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };
    const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
    if (loading) startSpin();

    /* -----------------------------
       Loading Screen
    ------------------------------*/
    if (loading || !profile) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.center}>
                    <Animated.Text style={[styles.spinner, { transform: [{ rotate: spin }] }]}>✨</Animated.Text>
                    <Text style={styles.loading}>正在載入你的命盤 ...</Text>
                </View>
            </SafeAreaView>
        );
    }

    /* -----------------------------
       Main Fortune Content
    ------------------------------*/
    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.pageTitle}>知行順勢</Text>

                {/* 基本資料 */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>👤 基本資料</Text>
                    <Text style={styles.cardText}>性別：{profile.gender}</Text>
                    <Text style={styles.cardText}>出生：{profile.dob}</Text>
                    {profile.tob && <Text style={styles.cardText}>時間：{profile.tob}</Text>}
                    {profile.pob && <Text style={styles.cardText}>地點：{profile.pob}</Text>}
                </View>

                {/* 八字 + 五行 */}
                {bazi?.pillars && bazi?.five_elements_strength && (
                    <View style={styles.row}>
                        <View style={styles.halfCard}>
                            <Text style={styles.cardTitle}>八字四柱</Text>
                            <Text style={styles.cardText}>年柱：{bazi.pillars.year.gan_local}{bazi.pillars.year.zhi_local}</Text>
                            <Text style={styles.cardText}>月柱：{bazi.pillars.month.gan_local}{bazi.pillars.month.zhi_local}</Text>
                            <Text style={styles.cardText}>日柱：{bazi.pillars.day.gan_local}{bazi.pillars.day.zhi_local}（日主）</Text>
                            <Text style={styles.cardText}>時柱：{bazi.pillars.hour.gan_local}{bazi.pillars.hour.zhi_local}</Text>
                        </View>
                        <View style={styles.halfCard}>
                            <Text style={styles.cardTitle}>五行分佈</Text>
                            {Object.entries(bazi.five_elements_strength).map(([key, value]) => (
                                <Text key={key} style={styles.cardText}>{fiveElementCN[key]}：{renderDots(value)}</Text>
                            ))}
                            <Text style={[styles.cardText, styles.italic]}>{getFiveElementSummary(bazi.five_elements_strength)}</Text>
                        </View>
                    </View>
                )}

                {/* 開運元素 */}
                {lucky && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>開運元素</Text>
                        <Text style={styles.cardText}>🎨 幸運顏色：{lucky.colors.join("、")}</Text>
                        <Text style={styles.cardText}>🔢 幸運數字：{lucky.numbers.join(" · ")}</Text>
                        {amulet && <Text style={styles.cardText}>🧿 開運物：{amulet}</Text>}
                    </View>
                )}

                {/* 地域建議 */}
                {regional && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🌏 地域 / 方向</Text>
                        <Text style={styles.cardText}>宜：{regional.suitable_regions.join("、")}</Text>
                        <Text style={styles.cardText}>忌：{regional.avoid_regions.join("、")}</Text>
                        <Text style={styles.cardText}>{regional.directions}</Text>
                        <Text style={[styles.cardText, styles.italic]}>{regional.reasoning}</Text>
                    </View>
                )}

                {/* 流年運勢 */}
                {yearOutlook && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🔮 2026 年流年重點</Text>
                        <Text style={styles.cardText}>📌 {yearOutlook.theme}</Text>
                        <Text style={styles.cardText}>🩺 {yearOutlook.health}</Text>
                        <Text style={styles.cardText}>❤️ {yearOutlook.relationships}</Text>
                        <Text style={styles.cardText}>💼 {yearOutlook.career}</Text>
                        <Text style={styles.cardText}>📈 {yearOutlook.investment}</Text>
                        <Text style={[styles.cardText, styles.italic]}>👉 {yearOutlook.key_advice}</Text>
                    </View>
                )}

                <View style={{ marginBottom: 32 }}>
                    <Button title="修改個人資料" onPress={() => router.push("/profile")} color="#FFA500" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* -----------------------------
   Styles
------------------------------*/
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#121212" },
    scrollContent: { padding: 24, alignItems: "center" },
    pageTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 16, textAlign: "center" },
    card: {
        width: "100%", maxWidth: 400,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#55555550",
        backgroundColor: "#1f1f1f20",
        padding: 24,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    cardTitle: { fontSize: 18, fontWeight: "700", color: "#FFD700", marginBottom: 8 },
    cardText: { fontSize: 14, color: "#fff", lineHeight: 22 },
    italic: { fontStyle: "italic", color: "#AAAAAA", marginTop: 6 },
    row: { flexDirection: "row", gap: 12, width: "100%", maxWidth: 400, marginBottom: 16 },
    halfCard: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#55555550",
        backgroundColor: "#1f1f1f20",
        padding: 16,
    },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loading: { fontSize: 16, color: "#888", marginTop: 12 },
    spinner: { fontSize: 40, color: "#FFA500", marginBottom: 12 },
});
