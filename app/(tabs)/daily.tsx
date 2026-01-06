// daily.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* -----------------------------
   Types matching backend JSON
------------------------------*/

interface Pillar {
    gan: string;
    zhi: string;
    gan_local: string;
    zhi_local: string;
}

interface BaziBasic {
    pillar_string?: string;
    day_master?: string;
    day_master_local?: string;
    pillars?: {
        year: Pillar;
        month: Pillar;
        day: Pillar;
        hour: Pillar;
    };
    five_elements_strength?: Record<string, number>;
}

interface YearOutlook {
    theme: string;
    health: string;
    relationships: string;
    career: string;
    investment: string;
    key_advice: string;
}

interface LuckyColorsNumbers {
    colors: string[];
    numbers: number[];
}

interface RegionalAdvice {
    suitable_regions: string[];
    avoid_regions: string[];
    directions: string;
    reasoning: string;
}

export interface BaziProfile {
    dob: string;
    tob?: string;
    pob?: string;
    gender: string;
    bazi_basic?: BaziBasic;
}

/* -----------------------------
   Helpers
------------------------------*/

const renderDots = (count: number) => "●".repeat(count || 0);

const fiveElementCN: Record<string, string> = {
    Wood: "木",
    Fire: "火",
    Earth: "土",
    Metal: "金",
    Water: "水",
};

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
   Component
------------------------------*/
export default function Daily() {
    const router = useRouter();

    const [profile, setProfile] = useState<BaziProfile | null>(null);
    const [yearOutlook, setYearOutlook] = useState<YearOutlook | null>(null);
    const [luckyColorsNumbers, setLuckyColorsNumbers] = useState<LuckyColorsNumbers | null>(null);
    const [regionalAdvice, setRegionalAdvice] = useState<RegionalAdvice | null>(null);
    const [amulet, setAmulet] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const todayKey = `flowmind_daily_${new Date().toISOString().slice(0, 10)}`;

    useEffect(() => {
        loadDaily();
    }, []);

    const loadDaily = async () => {
        try {
            const storedProfile = await AsyncStorage.getItem("flowmind_profile");
            if (!storedProfile) {
                router.replace("/profile");
                return;
            }

            const parsedProfile: BaziProfile = JSON.parse(storedProfile);
            setProfile(parsedProfile);

            const cached = await AsyncStorage.getItem(todayKey);
            if (cached) {
                hydrate(JSON.parse(cached));
                setLoading(false);
                return;
            }

            const payload = {
                date: parsedProfile.dob,
                time: parsedProfile.tob || "12:00",
                location: parsedProfile.pob || "Asia/Hong_Kong",
                gender: parsedProfile.gender === "男" ? "Male" : "Female",
                year: "2026",
                lang: "cn",
                llm: "openai",
            };

            const response = await fetch("http://memorykeeper.duckdns.org:8000/bazi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error(`Status ${response.status}`);

            const data = await response.json();
            hydrate(data);
            await AsyncStorage.setItem(todayKey, JSON.stringify(data));
            setLoading(false);
        } catch (err) {
            console.error("Daily load error:", err);
            router.replace("/profile");
        }
    };

    const hydrate = (data: any) => {
        setYearOutlook(data.year_2026_outlook || null);
        setLuckyColorsNumbers(data.lucky_colors_numbers || null);
        setRegionalAdvice(data.regional_advice || null);
        setAmulet(data.amulet || null);

        setProfile((prev) =>
            prev
                ? { ...prev, bazi_basic: data.bazi_basic }
                : { dob: "", gender: "", bazi_basic: data.bazi_basic }
        );
    };

    const refresh = async () => {
        await AsyncStorage.removeItem(todayKey);
        setLoading(true);
        loadDaily();
    };

    if (loading || !profile) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#FFA500" />
                <Text style={styles.loading}>載入今日命理中…</Text>
            </SafeAreaView>
        );
    }

    const bazi = profile.bazi_basic;

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

                {bazi?.pillars && bazi?.five_elements_strength && (
                    <View style={styles.row}>
                        {/* 八字四柱 */}
                        <View style={styles.halfCard}>
                            <Text style={styles.cardTitle}>八字四柱</Text>
                            <View style={{ marginTop: 8 }}>
                                <Text style={styles.cardText}>
                                    年柱：{bazi.pillars.year.gan_local}{bazi.pillars.year.zhi_local}
                                </Text>
                                <Text style={styles.cardText}>
                                    月柱：{bazi.pillars.month.gan_local}{bazi.pillars.month.zhi_local}
                                </Text>
                                <Text style={styles.cardText}>
                                    日柱：{bazi.pillars.day.gan_local}{bazi.pillars.day.zhi_local}（日主）
                                </Text>
                                <Text style={styles.cardText}>
                                    時柱：{bazi.pillars.hour.gan_local}{bazi.pillars.hour.zhi_local}
                                </Text>
                            </View>
                        </View>

                        {/* 五行分佈 */}
                        <View style={styles.halfCard}>
                            <Text style={styles.cardTitle}>五行分佈</Text>
                            {Object.entries(bazi.five_elements_strength).map(([key, value]) => (
                                <Text key={key} style={styles.cardText}>
                                    {fiveElementCN[key]}：{renderDots(value)}
                                </Text>
                            ))}

                            <View style={{ marginTop: 12 }}>
                                <Text style={styles.cardTitle}>強弱</Text>
                                <Text style={[styles.cardText, styles.italic]}>
                                    {getFiveElementSummary(bazi.five_elements_strength)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}


                {/* 開運元素 */}
                {luckyColorsNumbers && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>開運元素</Text>
                        <Text style={styles.cardText}>🎨 幸運顏色：{luckyColorsNumbers.colors.join("、")}</Text>
                        <Text style={styles.cardText}>🔢 幸運數字：{luckyColorsNumbers.numbers.join(" · ")}</Text>
                        {amulet && <Text style={styles.cardText}>🧿 開運物：{amulet}</Text>}
                    </View>
                )}

                {/* 地域建議 */}
                {regionalAdvice && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🌏 地域 / 方向</Text>
                        <Text style={styles.cardText}>宜：{regionalAdvice.suitable_regions.join("、")}</Text>
                        <Text style={styles.cardText}>忌：{regionalAdvice.avoid_regions.join("、")}</Text>
                        <Text style={styles.cardText}>{regionalAdvice.directions}</Text>
                        <Text style={[styles.cardText, styles.italic]}>{regionalAdvice.reasoning}</Text>
                    </View>
                )}

                {/* 年度運勢 */}
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
                    <Button title="重新計算" onPress={refresh} color="#FFA500" />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

/* -----------------------------
   Styles (Dark / Card Style)
------------------------------*/
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#121212" },
    scrollContent: { padding: 24, alignItems: "center" },
    pageTitle: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 16, textAlign: "center" },
    card: {
        width: "100%",
        maxWidth: 400,
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
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    loading: { fontSize: 16, color: "#888", marginTop: 12 },

    row: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
        maxWidth: 400,
        marginBottom: 16,
    },

    halfCard: {
        flex: 1,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#55555550",
        backgroundColor: "#1f1f1f20",
        padding: 16,
    },
});
