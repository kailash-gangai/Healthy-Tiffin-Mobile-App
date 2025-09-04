import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    Image,
    TouchableOpacity,
    ScrollView,
    Platform,
    GestureResponderEvent,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Fontisto } from '@react-native-vector-icons/fontisto';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { Dimensions } from 'react-native';
import FormInput from '../../components/FormInput';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { customerRecover } from '../../shopify/mutation/CustomerAuth';
import { COLORS } from '../../ui/theme';


type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = {
    navigation: AboutScreenNavigationProp;
};
const { width, height } = Dimensions.get('window');
const heroHeight = Math.max(240, Math.min(480, Math.round(height * 0.4)));

const ForgetPasswordScreen: React.FC<Props> = ({ navigation }) => {

    const [email, setEmail] = useState<string>('');
    const [errors, setErrors] = useState<any>({});

    const onSubmit = () => {
        // TODO: form validation + submit
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            setErrors({ email: 'Please enter a valid email address.' });
            return;
        }
        try {
            const response = customerRecover(email);
            console.log(response);
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert("Error", error.message);
            } else {
                Alert.alert("Error", "An error occurred.");

            }
        }
        // navigation.navigate('CodeVerification');

    };

    return (
        <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
            {/* HERO with image + logo + titles */}
            <View style={styles.heroWrap}>
                <ImageBackground
                    source={require('../../assets/banners/chana.jpg')}
                    resizeMode="cover"
                    style={styles.heroBg}
                    imageStyle={{ opacity: 0.85 }}
                >
                    <View style={styles.overlay} />
                    <View style={styles.heroContent}>
                        <Image
                            source={require('../../assets/LOGO.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>Oops! </Text>
                        <Text style={styles.welcome}>Did you forget your password?</Text>
                    </View>
                </ImageBackground>
            </View>

            {/* CARD */}
            <View style={styles.card}>

                <Text style={styles.message}>Please enter the registered email address to get the verification code.</Text>

                <FormInput
                    label="Email Address"
                    icon="email"
                    placeholder="Enter email address"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    returnKeyType="next"
                />

                {errors.email && <Text style={{ color: COLORS.red }}>{errors.email}</Text>}

                <TouchableOpacity activeOpacity={0.9} style={styles.ctaBtn} onPress={() => {
                    onSubmit();
                    // navigation.navigate("CodeVerification");
                }}>
                    <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        colors={[COLORS.green, COLORS.greenLight]}
                        style={styles.ctaGradient}
                    >
                        <Text style={styles.ctaText}>Continue </Text>
                        <FontAwesome5 iconStyle='solid' name="sign-in-alt" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
                    </LinearGradient>
                </TouchableOpacity>


                {/* Footer */}
                <View style={styles.footerRow}>
                    <Text style={styles.footerText}>Back to</Text>
                    <TouchableOpacity onPress={() => { navigation.navigate("SignIn") }}>
                        <Text style={styles.footerLink}> Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default ForgetPasswordScreen;

const styles = StyleSheet.create({

    heroWrap: { height: heroHeight, backgroundColor: COLORS.green },
    heroBg: { flex: 1, justifyContent: 'flex-end' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0s,0,0.35)' },
    heroContent: { paddingHorizontal: 12, paddingBottom: 60, alignItems: 'center' },
    logo: {
        width: 150, height: 150, marginBottom: 8,
    },
    title: { fontSize: 28, color: COLORS.white, fontWeight: '800' },
    welcome: { color: COLORS.white, textAlign: 'center', fontSize: 20, marginTop: 4, lineHeight: 34 },

    card: {
        flex: 1,
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        marginTop: -20,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 28 + (Platform.OS === 'ios' ? 10 : 16),
    },
    message: {
        fontSize: 18,
        color: COLORS.black,
        paddingHorizontal: 4,
        marginTop: 10,

    },
    ctaBtn: { marginTop: 18 },
    ctaGradient: {
        height: 54,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    ctaText: { color: COLORS.white, fontWeight: '800', letterSpacing: 0.2, fontSize: 16 },

    footerRow: { marginTop: 22, flexDirection: 'row', justifyContent: 'center' },
    footerText: { color: COLORS.subText },
    footerLink: { color: COLORS.green, fontWeight: '800' },
});

