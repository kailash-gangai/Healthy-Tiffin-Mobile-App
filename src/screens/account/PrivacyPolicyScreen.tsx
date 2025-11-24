import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { COLORS, SPACING } from '../../ui/theme';


export default function PrivacyPolicyScreen({ navigation }: any) {
      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
                  {/* Header */}
                  <AppHeader title="Privacy Policy" onBack={() => navigation.goBack()} />

                  <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.wrap}
                        showsVerticalScrollIndicator={false}
                  >
                        {/* Illustration */}
                        <Image
                              source={require('../../assets/icons/privacy.png')}
                              style={styles.img}
                              resizeMode="contain"
                        />

                        {/* Body text */}
                        <Text style={styles.paragraph}>
                              This Privacy Policy describes how Healthy Tiffin ("we", "us", "our")
                              collects, uses, and discloses your personal information when you visit,
                              use our services, or make a purchase from healthytiffin.myshopify.com
                              (the "Site") or communicate with us (collectively, the "Services").
                        </Text>

                        <Text style={styles.paragraph}>
                              By accessing or using the Services, you agree to the collection,
                              processing, and disclosure of your information as described in this
                              Privacy Policy. If you do not agree, please discontinue use of the
                              Services.
                        </Text>

                        {/* SECTION */}
                        <Text style={styles.heading}>Changes to This Privacy Policy</Text>
                        <Text style={styles.paragraph}>
                              We may update this Privacy Policy from time to time to reflect changes
                              in our practices or for operational, legal, or regulatory reasons.
                              Updates will appear on this page with an updated "Last Updated" date.
                        </Text>

                        {/* SECTION */}
                        <Text style={styles.heading}>How We Collect and Use Your Information</Text>
                        <Text style={styles.paragraph}>
                              We collect personal information about you from various sources to
                              provide and improve our Services. Information collected depends on how
                              you interact with the Site.
                        </Text>

                        <Text style={styles.subheading}>Information You Provide Directly</Text>
                        <Text style={styles.paragraph}>
                              • Contact details (name, address, phone number, email){"\n"}
                              • Order information (billing, shipping, payment details){"\n"}
                              • Account information (username, password, security details){"\n"}
                              • Shopping activity (cart, purchases, loyalty points, reviews, referrals){"\n"}
                              • Customer support messages or details you choose to share{"\n"}
                        </Text>

                        <Text style={styles.subheading}>Information Collected Automatically</Text>
                        <Text style={styles.paragraph}>
                              We may use cookies and similar technologies to collect Usage Data,
                              including device details, IP address, browser info, and interaction
                              patterns when you use the Services.
                        </Text>

                        <Text style={styles.subheading}>Information From Third Parties</Text>
                        <Text style={styles.paragraph}>
                              We may receive information from Shopify, payment processors, analytics
                              providers, or marketing partners who assist in operating the Site.
                        </Text>

                        {/* SECTION */}
                        <Text style={styles.heading}>How We Use Personal Information</Text>
                        <Text style={styles.paragraph}>
                              • Provide products and services{"\n"}
                              • Process payments and fulfill orders{"\n"}
                              • Improve user experience{"\n"}
                              • Send marketing and promotional materials{"\n"}
                              • Detect and prevent fraud{"\n"}
                              • Provide customer support{"\n"}
                        </Text>

                        {/* SECTION */}
                        <Text style={styles.heading}>Cookies</Text>
                        <Text style={styles.paragraph}>
                              We use cookies to operate and optimize the Site. You may disable cookies
                              through browser settings, but doing so may limit Site functionality.
                        </Text>

                        {/* SECTION */}
                        <Text style={styles.heading}>How We Disclose Personal Information</Text>
                        <Text style={styles.paragraph}>
                              We may disclose information to vendors, marketing partners, affiliates,
                              and service providers. We may also share information during business
                              transactions or when legally required.
                        </Text>

                        {/* SECTION */}
                        <Text style={styles.heading}>Children's Data</Text>
                        <Text style={styles.paragraph}>
                              Our Services are not intended for children. We do not knowingly collect
                              personal information from minors.
                        </Text>

                        {/* SECTION */}
                        <Text style={styles.heading}>Security and Retention</Text>
                        <Text style={styles.paragraph}>
                              We take reasonable security measures but cannot guarantee absolute
                              protection. Personal information is retained as needed to operate the
                              Services, comply with laws, and resolve disputes.
                        </Text>

                        {/* SECTION */}
                        <Text style={styles.heading}>Your Rights</Text>
                        <Text style={styles.paragraph}>
                              Depending on your location, you may have the right to access, delete,
                              correct, or request a copy of your personal information. You may also
                              restrict processing or withdraw consent.
                        </Text>

                        {/* SECTION */}
                        <Text style={styles.heading}>International Users</Text>
                        <Text style={styles.paragraph}>
                              Your information may be transferred and processed outside your country
                              of residence, including by third-party providers under appropriate legal
                              safeguards.
                        </Text>

                        {/* SECTION */}
                        <Text style={styles.heading}>Contact Us</Text>
                        <Text style={styles.paragraph}>
                              For questions or privacy requests, contact us at:{"\n"}
                              Email: support@myhealthytiffin.com{"\n"}
                              Address: 2050 Concourse Drive, San Jose, CA, 95131, US
                        </Text>
                  </ScrollView>
            </SafeAreaView>
      );
}

const styles = StyleSheet.create({
      wrap: { padding: SPACING * 2, paddingBottom: 30 },
      img: { width: 80, height: 80, alignSelf: 'center', marginVertical: 20 },
      txt: { color: COLORS.black, fontSize: 18, lineHeight: 28 },
      heading: {
            fontSize: 18,
            fontWeight: "600",
            marginTop: 20,
            marginBottom: 4,
      },
      subheading: {
            fontSize: 15,
            fontWeight: "600",
            marginTop: 12,
            marginBottom: 5,
      },
      paragraph: {
            fontSize: 14,
            lineHeight: 22,
            color: "#444",
      },
});
