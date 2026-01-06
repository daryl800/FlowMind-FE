import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { CalendarDays, MapPin, Sparkles, User } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import ModalSelector from "react-native-modal-selector";

// --- Constants ---
const locations = [
    { label: "香港", value: "Asia/Hong_Kong" },
    { label: "上海", value: "Asia/Shanghai" },
    { label: "台北", value: "Asia/Taipei" },
    { label: "新加坡", value: "Asia/Singapore" },
    { label: "東京", value: "Asia/Tokyo" },
    { label: "紐約", value: "America/New_York" },
    { label: "洛杉磯", value: "America/Los_Angeles" },
    { label: "倫敦", value: "Europe/London" },
];

const timeItems = [
    { key: "12:00", label: "不知道" },
    { key: "03:00", label: "午夜 (00:00-05:59)" },
    { key: "09:00", label: "早上 (06:00-11:59)" },
    { key: "14:00", label: "下午 (12:00-17:59)" },
    { key: "21:00", label: "晚上 (18:00-23:59)" },
    ...Array.from({ length: 24 }, (_, i) => {
        const hh = i.toString().padStart(2, "0");
        return { key: `${hh}:00`, label: `${hh}:00` };
    }),
];

// --- Component ---
export const ProfileForm = () => {
    const router = useRouter();
    const { height } = useWindowDimensions();

    // --- State ---
    const [date, setDate] = useState(""); // YYYY-MM-DD
    const [hour, setHour] = useState("12:00"); // default 不知道
    const [location, setLocation] = useState("Asia/Hong_Kong");
    const [gender, setGender] = useState<"男" | "女" | "">("");
    const [submitting, setSubmitting] = useState(false);

    // --- Handlers ---
    const submit = async () => {
        if (!date || !gender) return;

        setSubmitting(true);

        const profile = {
            dob: date,
            tob: hour,
            pob: location,
            gender,
            createdAt: Date.now(),
        };

        await AsyncStorage.setItem("flowmind_profile", JSON.stringify(profile));

        setTimeout(() => {
            setSubmitting(false);
            router.push("/daily");
        }, 800);
    };

    // --- Render ---
    return (
        <View style={styles.container}>
            {/* Birth Date */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    <CalendarDays size={16} color="#FFA500" /> 出生日期 <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[styles.inputBox, date ? styles.inputText : styles.placeholder]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#888888"
                    value={date}
                    onChangeText={setDate}
                />
            </View>

            {/* Time Selection */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    <CalendarDays size={16} color="#FFA500" /> 出生時辰
                </Text>
                <ModalSelector
                    data={timeItems}
                    initValue="選擇時辰"
                    onChange={(option) => setHour(option.key)}
                    style={styles.modalSelector}
                    selectTextStyle={{ color: hour === "" ? "#888" : "#fff" }}
                    optionTextStyle={{ color: "#000" }}
                    cancelText="取消"
                    optionContainerStyle={{ maxHeight: height * 0.3 }}
                />
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    <MapPin size={16} color="#FFA500" /> 出生地點（可選）
                </Text>
                <ModalSelector
                    data={locations.map((l) => ({ key: l.value, label: l.label }))}
                    initValue="選擇出生地點"
                    onChange={(option) => setLocation(option.key)}
                    style={styles.modalSelector}
                    selectTextStyle={{ color: location === "" ? "#888" : "#fff" }}
                    optionTextStyle={{ color: "#000" }}
                    cancelText="取消"
                    optionContainerStyle={{ maxHeight: height * 0.3 }}
                />
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>
                    <User size={16} color="#FFA500" /> 性別 <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.genderRow}>
                    {["男", "女"].map((g) => (
                        <Pressable
                            key={g}
                            onPress={() => setGender(g as any)}
                            style={[
                                styles.genderButton,
                                gender === g && styles.genderSelected,
                            ]}
                        >
                            <Text style={styles.genderText}>{g}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Submit */}
            <Pressable
                disabled={submitting || !date || !gender}
                style={[
                    styles.submitButton,
                    (submitting || !date || !gender) && styles.submitDisabled,
                ]}
                onPress={submit}
            >
                {submitting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <View style={styles.submitContent}>
                        <Sparkles size={18} color="white" />
                        <Text style={styles.submitText}>開啟命理之旅</Text>
                    </View>
                )}
            </Pressable>
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 24, paddingHorizontal: 16, gap: 24 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 14, color: "#AAAAAA", marginBottom: 6, flexDirection: "row", alignItems: "center" },
    required: { color: "#FFA500" },
    inputBox: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#555555", backgroundColor: "#2a2a2a", justifyContent: "center", paddingHorizontal: 12, color: "#fff" },
    inputText: { color: "#FFFFFF" },
    placeholder: { color: "#888888" },
    modalSelector: { backgroundColor: "#2a2a2a", borderRadius: 12 },
    genderRow: { flexDirection: "row", gap: 12 },
    genderButton: { flex: 1, height: 48, borderRadius: 12, borderWidth: 2, borderColor: "#555555", justifyContent: "center", alignItems: "center", backgroundColor: "#2a2a2a" },
    genderSelected: { borderColor: "#FFA500", backgroundColor: "#FFA50022", shadowColor: "#FFA500", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6 },
    genderText: { fontSize: 16, fontWeight: "500", color: "#fff" },
    submitButton: { height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center", backgroundColor: "#FFA500" },
    submitDisabled: { backgroundColor: "#FFA50066" },
    submitContent: { flexDirection: "row", alignItems: "center", gap: 8 },
    submitText: { color: "white", fontWeight: "600", fontSize: 16 },
});
