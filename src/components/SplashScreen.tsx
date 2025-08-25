import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, Animated, Dimensions } from "react-native";

interface SplashScreenProps {
    onFinish: () => void; // callback when animation ends
}

const { width, height } = Dimensions.get("window");

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // for logo fade
    const scaleAnim = useRef(new Animated.Value(0.8)).current; // for logo scale
    const screenFade = useRef(new Animated.Value(1)).current; // for whole screen fade-out

    useEffect(() => {
        // Step 1: Logo fade in + scale up
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Step 2: After 2s, fade out whole splash
        const timer = setTimeout(() => {
            Animated.timing(screenFade, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }).start(onFinish); // call parent callback
        }, 2000);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, screenFade, onFinish]);

    return (
        <Animated.View style={[styles.container, { opacity: screenFade }]}>
            {/* Top Right Circle */}
            <Image
                source={require("../assets/LOGO.png")}
                style={styles.topRightCircle}
                resizeMode="contain"
            />

            {/* Bottom Left Circle */}
            <Image
                source={require("../assets/LOGO.png")}
                style={styles.bottomLeftCircle}
                resizeMode="contain"
            />

            {/* Center Logo */}
            <Animated.Image
                source={require("../assets/LOGO.png")}
                style={[
                    styles.logo,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
                resizeMode="contain"
            />
        </Animated.View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 150,
        height: 150,
    },
    topRightCircle: {
        position: "absolute",
        top: -height * 0.1,
        right: -width * 0.2,
        width: width * 0.6,
        height: width * 0.6,
    },
    bottomLeftCircle: {
        position: "absolute",
        bottom: -height * 0.1,
        left: -width * 0.2,
        width: width * 0.6,
        height: width * 0.6,
    },
});
