import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Image, Animated, Dimensions } from "react-native";
import SvgTopRight from "../assets/svg/top--right-shape.svg";
import SvgBottomLeft from "../assets/svg/bottom-left-shape.svg";
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
            {/* <Image
                source={require("../assets/svg/top--right-shape.png")}
                style={styles.topRightCircle}
                resizeMode="contain"
            /> */}
            <SvgTopRight style={styles.topRightCircle} />

            {/* Bottom Left Circle */}
            {/* <Image
                source={require("../assets/svg/bottom-left-shape.svg")}
                style={styles.bottomLeftCircle}
                resizeMode="contain"
            /> */}
            <SvgBottomLeft style={styles.bottomLeftCircle} />

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
        width: 224,
        height: 224,
    },
    topRightCircle: {
        position: "absolute",
        top: 0,
        right: 0,
        // width: width,
        // height: width,
    },
    bottomLeftCircle: {
        position: "absolute",
        bottom: 0,
        left: 0,
        // width: width,
        // height: width,
    },
});
