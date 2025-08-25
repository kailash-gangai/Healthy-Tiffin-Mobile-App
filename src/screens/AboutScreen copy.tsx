import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";

const AboutScreen: React.FC = () => {
    return (
        <ScrollView style={styles.container}>
            {/* 1. Header Image */}
            <Image
                source={require("../assets/banners/chana.jpg")} // replace with your top image
                style={styles.headerImage}
                resizeMode="cover"
            />

            {/* 2. Green Section with Text */}
            <View style={styles.greenSection}>
                <Text style={styles.greenText}>
                    <Text style={{ fontWeight: "bold" }}>Fresh</Text> healthy meal{"\n"}
                    delivered <Text style={{ fontWeight: "bold" }}>daily!</Text>
                </Text>
            </View>

            {/* 3. Features Grid */}
            <View style={styles.featuresContainer}>
                <View style={styles.featureRow}>
                    <FeatureItem
                        icon={require("../assets/LOGO.png")}
                        title="Made Fresh Daily"
                    />
                    <FeatureItem
                        icon={require("../assets/LOGO.png")}
                        title="Veg, Non-Veg, Vegan, Jain"
                    />
                    <FeatureItem
                        icon={require("../assets/LOGO.png")}
                        title="Delivered Daily"
                    />
                </View>
                <View style={styles.featureRow}>
                    <FeatureItem
                        icon={require("../assets/LOGO.png")}
                        title="Zero Plastic"
                    />
                    <FeatureItem
                        icon={require("../assets/LOGO.png")}
                        title="Ayurveda"
                    />
                    <FeatureItem
                        icon={require("../assets/LOGO.png")}
                        title="Track Fitness Goals"
                    />
                </View>
            </View>

            {/* 4. Banner Section */}
            <View style={styles.banner}>
                <Image
                    source={require("../assets/banners/chana.jpg")} // background banner
                    style={styles.bannerImage}
                    resizeMode="cover"
                />
                <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerText}>
                        ALL <Text style={styles.highlight}>YOUR HEALTH</Text>{"\n"}
                        IN ONE <Text style={styles.highlight}>PLACE</Text>
                    </Text>
                </View>
            </View>

            {/* 5. CTA Button */}
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>TRY IT TODAY</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default AboutScreen;

interface FeatureItemProps {
    icon: any;
    title: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title }) => (
    <View style={styles.featureItem}>
        <Image source={icon} style={styles.featureIcon} resizeMode="contain" />
        <Text style={styles.featureText}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    headerImage: {
        width: "100%",
        height: 220,
    },
    greenSection: {
        backgroundColor: "#006400",
        padding: 20,
        alignItems: "center",
    },
    greenText: {
        color: "#fff",
        fontSize: 18,
        textAlign: "center",
        lineHeight: 24,
    },
    featuresContainer: {
        padding: 20,
    },
    featureRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    featureItem: {
        flex: 1,
        alignItems: "center",
        paddingHorizontal: 5,
    },
    featureIcon: {
        width: 60,
        height: 60,
        marginBottom: 8,
    },
    featureText: {
        textAlign: "center",
        fontSize: 12,
        color: "#333",
    },
    banner: {
        position: "relative",
        height: 180,
        marginVertical: 20,
    },
    bannerImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },
    bannerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
     
    },
    bannerText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600",
        textAlign: "center",
    },
    highlight: {
        fontWeight: "bold",
    },
    button: {
        marginHorizontal: 30,
        marginBottom: 40,
        paddingVertical: 15,
        backgroundColor: "#006400",
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
