import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useFortune() {
    const [profile, setProfile] = useState<BaziProfile | null>(null);
    const [bazi, setBazi] = useState<BaziBasic | null>(null);
    const [yearOutlook, setYearOutlook] = useState<YearOutlook | null>(null);
    const [lucky, setLucky] = useState<LuckyColorsNumbers | null>(null);
    const [regional, setRegional] = useState<RegionalAdvice | null>(null);
    const [amulet, setAmulet] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const todayKey = `flowmind_fortune_${new Date().toISOString().slice(0, 10)}`;

    const loadFortune = useCallback(async () => {
        try {
            const stored = await AsyncStorage.getItem("flowmind_profile");
            if (!stored) return; // handle missing profile in component

            const parsed: BaziProfile = JSON.parse(stored);
            setProfile(parsed);

            const cachedRaw = await AsyncStorage.getItem(todayKey);
            const cached = cachedRaw ? JSON.parse(cachedRaw) : null;

            const needsFetch =
                !cached ||
                cached.dob !== parsed.dob ||
                cached.gender !== parsed.gender ||
                cached.pob !== parsed.pob;

            if (!needsFetch) {
                // use cached
                setBazi(cached.bazi_basic);
                setYearOutlook(cached.year_2026_outlook);
                setLucky(cached.lucky_colors_numbers);
                setRegional(cached.regional_advice);
                setAmulet(cached.amulet);
                setLoading(false);
                return;
            }

            // fetch new data
            const payload = {
                date: parsed.dob,
                time: parsed.tob || "12:00",
                location: parsed.pob || "Asia/Hong_Kong",
                gender: parsed.gender === "男" ? "Male" : "Female",
                year: "2026",
                lang: "cn",
                llm: "openai",
            };

            const res = await fetch("http://memorykeeper.duckdns.org:8000/bazi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data = await res.json();

            setBazi(data.bazi_basic);
            setYearOutlook(data.year_2026_outlook);
            setLucky(data.lucky_colors_numbers);
            setRegional(data.regional_advice);
            setAmulet(data.amulet);

            // save cache
            await AsyncStorage.setItem(todayKey, JSON.stringify({ ...data, ...parsed }));
            setLoading(false);
        } catch (err) {
            console.error("loadFortune error:", err);
            setLoading(false);
        }
    }, []);

    // trigger on page focus
    useFocusEffect(
        useCallback(() => {
            setLoading(true); // show spinner while fetching
            loadFortune();
        }, [loadFortune])
    );

    return { profile, bazi, yearOutlook, lucky, regional, amulet, loading, loadFortune };
}
