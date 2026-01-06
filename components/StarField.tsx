import { useEffect, useState } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";

interface Star {
    id: number;
    x: number;
    y: number;
    size: number;
    opacity: Animated.Value;
}

export const StarField = () => {
    const [stars, setStars] = useState<Star[]>([]);

    useEffect(() => {
        const newStars: Star[] = [];
        for (let i = 0; i < 50; i++) {
            newStars.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2 + 1,
                opacity: new Animated.Value(Math.random()),
            });
        }
        setStars(newStars);

        // Animate twinkling
        newStars.forEach((star) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(star.opacity, {
                        toValue: 1,
                        duration: 1000 + Math.random() * 2000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.timing(star.opacity, {
                        toValue: 0.2,
                        duration: 1000 + Math.random() * 2000,
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        });
    }, []);

    return (
        <View style={styles.container}>
            {stars.map((star) => (
                <Animated.View
                    key={star.id}
                    style={[
                        styles.star,
                        {
                            left: `${star.x}%`,
                            top: `${star.y}%`,
                            width: star.size,
                            height: star.size,
                            borderRadius: star.size / 2,
                            opacity: star.opacity,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        inset: 0,
        zIndex: 0,
    },
    star: {
        position: "absolute",
        backgroundColor: "white",
    },
});
