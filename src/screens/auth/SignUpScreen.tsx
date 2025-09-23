import React, { useCallback, useEffect, useState } from 'react';
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
    KeyboardAvoidingView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Dimensions } from 'react-native';
import FormInput from '../../components/FormInput';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { customerUpsert, loginCustomer } from '../../shopify/mutation/CustomerAuth';
import { COLORS } from '../../ui/theme';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/slice/userSlice';
import { checkCustomerTokens, saveCustomerTokens } from '../../store/Keystore/customerDetailsStore';
import { showToastError, showToastSuccess } from '../../config/ShowToastMessages';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from "@react-native-firebase/auth";
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import Facebook from '../../assets/htf-icon/fb.svg';
import Insta from '../../assets/htf-icon/insta.svg';
import Google from '../../assets/htf-icon/google.svg';
import Apple from '../../assets/htf-icon/apple.svg';
import PasswoedIcon from '../../assets/htf-icon/icon-passwoed.svg';
import EmailIcon from '../../assets/htf-icon/icon-mail.svg';
import UserIcon from '../../assets/htf-icon/icon-user.svg';
import ContinueIcon from '../../assets/htf-icon/icon-continue.svg';
GoogleSignin.configure({
    // offlineAccess: true,
    webClientId: "678786774271-65v84fljs82onmftpju1fnhp1s2cnpcd.apps.googleusercontent.com",
    // ios
    iosClientId: "541872006500-5mlca2bgg8v4qb26muaabmcjepbekvf2.apps.googleusercontent.com",
    // android
    // androidClientId: "678786774271-65v84fljs82onmftpju1fnhp1s2cnpcd.apps.googleusercontent.com",
});
const { width, height } = Dimensions.get('window');
const heroHeight = Math.max(240, Math.min(480, Math.round(height * 0.35)));

type AboutScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type Props = {
    navigation: AboutScreenNavigationProp;
};
const SignUpScreen: React.FC<Props> = ({ navigation }) => {

    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const kbOffset = Platform.select({
        ios: insets.top + 12,   // so content lifts above the iOS keyboard
        android: 0,
    }) as number;
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [pass, setPass] = useState<string>('');
    const [errors, setErrors] = useState<any>({});
    const [isloading, setIsloading] = useState(false);
    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 6; // Simple check for password length
    };

    const validateName = (name: string) => {
        const [firstName, lastName] = name.trim().split(" ");
        return firstName && lastName; // Ensure both first and last name are present
    };
    const onSubmit = useCallback(async (_: GestureResponderEvent) => {
        setIsloading(true);
        setErrors({});
        if (!name || !email || !pass) {
            setErrors({ name: name ? '' : 'Is required', email: email ? '' : 'Is required', pass: pass ? '' : 'Is required' });
            setIsloading(false);
            return;
        }
        if (!validateEmail(email)) {
            setErrors({ email: 'Please enter a valid email address.' });
            setIsloading(false);
            return;
        }
        if (!validateName(name)) {
            setErrors({ name: 'Please enter your full name.' });
            setIsloading(false);
            return;
        }
        if (!validatePassword(pass)) {
            setErrors({ pass: 'Password must be at least 6 characters.' });
            setIsloading(false);
            return;
        }

        const [firstName, lastName] = name.trim().split(" ");

        const userData = {
            email,
            password: pass,
            firstName,
            lastName,
        };
        try {
            const response = await customerUpsert(userData);
            if (response?.customerCreate?.customerUserErrors) {
                setIsloading(false);
                Alert.alert("Error", response.customerCreate.customerUserErrors[0]?.message);
            }
            if (response?.customerCreate?.customer?.id) {
                const login = await loginCustomer(userData);
                if (login?.customerAccessTokenCreate?.customerAccessToken?.accessToken) {
                    const customerToken = login.customerAccessTokenCreate.customerAccessToken.accessToken;
                    const tokenExpire = login.customerAccessTokenCreate.customerAccessToken.expiresAt;
                    saveCustomerTokens({ customerToken, tokenExpire });
                    let customerdetails = checkCustomerTokens();
                    customerdetails.then(async (result) => {
                        console.log('result', result);
                        if (result) {
                            dispatch(setUser(result));
                        }
                    });
                    setIsloading(false);
                    showToastSuccess('Customer registration successful.');
                    // setTimeout(() => {
                    navigation.navigate('SelectPreferences');
                    // }, 3000);
                }
                setIsloading(false);
            }
        } catch (error) {
            setIsloading(false);
            showToastError(error instanceof Error ? error.message : "An error occurred.");
        }
    }, [name, email, pass]);

    useEffect(() => {

    }, []);

    async function onGoogleButtonPress() {

        try {
            // await GoogleSignin.hasPlayServices();
            // await GoogleSignin.signOut();

            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            // Obtain the user's ID token
            const data: any = await GoogleSignin.signIn();
            console.log('data: ', data);
            // create a new firebase credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(
                data?.data.idToken,
            );

            console.log('credential: ', googleCredential);
            // login with credential
            await auth().signInWithCredential(googleCredential);

            //  Handle the linked account as needed in your app
            return;
        } catch (e) {
            console.log('e: ', e);
        }
    }
    const GoogleSingUp = async () => {
        try {
            console.log('GoogleSingUp');
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            await GoogleSignin.signOut();
            // Get the users ID token
            const signInResult = await GoogleSignin.signIn();
            console.log('signInResult', signInResult);
            // Try the new style of google-sign in result, from v13+ of that module
            let idToken = signInResult.data?.idToken;
            if (!idToken) {
                idToken = signInResult.idToken;
            }
            if (!idToken) {
                throw new Error('No ID token found');
            }

            // Create a Google credential with the token
            const googleCredential = GoogleAuthProvider.credential(signInResult.data.idToken);
            console.log('googleCredential', googleCredential);
            // Sign-in the user with the credential
            return signInWithCredential(getAuth(), googleCredential);
        } catch (error) {
            console.log('error: ', error);
        }
        // try {
        //     await GoogleSignin.hasPlayServices();
        //     const userInfo = await GoogleSignin.signIn();
        //     // Send userInfo.idToken to your backend for verification
        //     console.log(userInfo);

        //     const customerData = {
        //         email: userInfo?.data.user.email,
        //         first_name: userInfo?.data.user.givenName,
        //         last_name: userInfo?.data.user.familyName,
        //     };
        //     var Multipassify = require('multipassify');

        //     const multipass = new Multipassify('2456b37a3afcb621ee972127be9c6024');
        //     const mpToken = multipass.encode({
        //         email: userInfo?.data.user.email,
        //         first_name: userInfo?.data.user.givenName,
        //         last_name: userInfo?.data.user.familyName,
        //         return_to: 'https://healthytiffin.com',
        //     });
        //     const query = `
        //         mutation($token: String!) {
        //           customerAccessTokenCreateWithMultipass(multipassToken: $token) {
        //             customerAccessToken { accessToken expiresAt }
        //             customerUserErrors { field message code }
        //           }
        //         }`;

        //     const res = await fetch(STORE_API_URL!, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'X-Shopify-Storefront-Access-Token': STOREFRONT_PUBLIC_TOKEN!,
        //         },
        //         body: JSON.stringify({ query, variables: { token: mpToken } }),
        //     });

        //     const json = await res.json();
        //     console.log('customerData', customerData);

        // } catch (error) {
        //     console.error(error);
        // }
    };
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={kbOffset}
        >
            <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ flexGrow: 1 }}
                bounces={false} >

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
                            <Text style={styles.title}>Sign Up</Text>
                            <Text style={styles.welcome}>Welcome!</Text>
                            <Text style={styles.subtitle}>Please enter the details to proceed.</Text>
                        </View>
                    </ImageBackground>
                </View>

                {/* CARD */}

                <View style={styles.card}>
                    <FormInput
                        label="Full Name"
                        icon={<UserIcon width={24} height={24} />}
                        placeholder="Enter full name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                        returnKeyType="next"
                    />
                    {errors.name && (
                        <Text style={{ color: COLORS.red, fontSize: 14, marginLeft: 12 }}>{errors.name}</Text>
                    )}

                    <FormInput
                        label="Password"
                        icon={<PasswoedIcon width={24} height={24} />}
                        placeholder="Enter password"
                        secure
                        value={pass}
                        onChangeText={setPass}
                        returnKeyType="next"
                    />
                    {errors.pass && (
                        <Text style={{ color: COLORS.red, fontSize: 14, marginLeft: 12 }}>{errors.pass}</Text>
                    )}

                    <FormInput
                        label="Email Address"
                        icon={<EmailIcon width={24} height={24} />}
                        placeholder="Enter email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        returnKeyType="done"
                    />
                    {errors.email && (
                        <Text style={{ color: COLORS.red, fontSize: 14, marginLeft: 12 }}>{errors.email}</Text>
                    )}

                    {/* CTA */}
                    <TouchableOpacity disabled={isloading} activeOpacity={0.9} style={styles.ctaBtn} onPress={onSubmit}>
                        <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            colors={[COLORS.green, COLORS.greenLight]}
                            style={styles.ctaGradient}
                        >
                            <Text style={styles.ctaText}>Sign Up</Text>
                            {isloading ? (
                                <ActivityIndicator size="small" style={{ marginLeft: 8 }} color={COLORS.white} />
                            ) : (
                                <ContinueIcon width={24} height={24}/>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerWrap}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>Or</Text>
                        <View style={styles.line} />
                    </View>

                    {/* Social buttons row */}
                    <View style={styles.socialRow}>
                        <CircleBtn
                            bg="#1877F2"
                            icon={<Facebook height={30} width={30} />}
                            onPress={() => { }}
                        />
                        <InstaBtn onPress={() => { }} />
                        <CircleBtn
                            bg="#EA4335"
                            icon={<Google height={30} width={30} />}
                            onPress={() => {
                                GoogleSingUp();
                            }}
                        />
                        <CircleBtn
                            bg="#000000"
                            icon={<Apple height={30} width={30} />}
                            onPress={() => { }}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => { navigation.navigate('SignIn') }}>
                            <Text style={styles.footerLink}> Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

type CircleBtnProps = {
    bg: string;
    icon: React.ReactNode;
    onPress?: (e: GestureResponderEvent) => void;
};

const CircleBtn: React.FC<CircleBtnProps> = ({ bg, icon, onPress }) => (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        <View style={[styles.circle, { backgroundColor: bg }]}>
            {icon}
        </View>
    </TouchableOpacity>
);

type InstaBtnProps = { onPress?: (e: GestureResponderEvent) => void };

const InstaBtn: React.FC<InstaBtnProps> = ({ onPress }) => (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        <LinearGradient
            colors={[
                '#405DE6', '#5851DB', '#833AB4', '#C13584',
                '#E1306C', '#FD1D1D', '#F56040', '#FCAF45', '#FFDC80',
            ]}
            style={styles.circle}
        >
            <Insta height={30} width={30} />
        </LinearGradient>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    /** HERO */
    heroWrap: { height: heroHeight, backgroundColor: COLORS.green },
    heroBg: { flex: 1, justifyContent: 'flex-end' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
    heroContent: { paddingHorizontal: 12, paddingBottom: 60, alignItems: 'center' },
    logo: {
        width: 150, height: 150, marginBottom: 8,
    },
    title: { fontSize: 28, color: COLORS.white, fontWeight: '800' },
    welcome: { color: COLORS.white, textAlign: 'center', fontSize: 20, marginTop: 4, lineHeight: 34 },
    subtitle: { color: COLORS.white, opacity: 0.9, fontSize: 20, marginTop: 2, marginBottom: 10 },

    /** CARD */
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

    /** CTA */
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

    /** Divider + Socials */
    dividerWrap: { marginTop: 20, alignItems: 'center', flexDirection: 'row' },
    line: { flex: 1, height: 1, backgroundColor: COLORS.divider },
    orText: { marginHorizontal: 12, color: COLORS.subText, fontWeight: '600' },
    socialRow: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    circle: {
        width: 60, height: 60, borderRadius: 999,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 }, elevation: 3,
    },

    /** Footer */
    footerRow: { marginTop: 22, flexDirection: 'row', justifyContent: 'center' },
    footerText: { color: COLORS.subText },
    footerLink: { color: COLORS.green, fontWeight: '800' },
});

export default SignUpScreen;
