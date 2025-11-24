import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';

import { COLORS, SPACING } from '../../ui/theme';

export default function TermsOfServiceScreen({ navigation }: any) {
      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
                  {/* Header */}
                  <AppHeader title="Terms of Use" onBack={() => navigation.goBack()} />

                  <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.wrap}
                        showsVerticalScrollIndicator={false}
                  >
                        {/* Illustration */}
                        <Image
                              source={require('../../assets/icons/terms-and-conditions.png')}
                              style={styles.img}
                              resizeMode="contain"
                        />

                        {/* Body text */}
                        {/* 1 */}
                        <Text style={styles.heading}>1. General Information Only</Text>
                        <Text style={styles.paragraph}>
                              The information provided on this website, including recipes, nutritional
                              information, and health tips, is for general informational purposes
                              only. While we strive to ensure accuracy, we make no guarantees about
                              completeness, reliability, or accuracy of any information.
                        </Text>

                        {/* 2 */}
                        <Text style={styles.heading}>2. Not a Substitute for Professional Advice</Text>
                        <Text style={styles.paragraph}>
                              The content on this website is not intended to be a substitute for
                              professional medical advice, diagnosis, or treatment. Always seek the
                              guidance of your physician, nutritionist, or another qualified health
                              provider regarding any medical condition or dietary needs.
                        </Text>

                        {/* 3 */}
                        <Text style={styles.heading}>3. Allergy and Dietary Information</Text>
                        <Text style={styles.paragraph}>
                              Recipes and food products featured on this website may contain allergens
                              or ingredients unsuitable for certain individuals. It is your
                              responsibility to verify all allergens and dietary restrictions before
                              using any recipe or product. We are not liable for adverse reactions to
                              food consumed, including food prepared based on our recipes or products.
                        </Text>

                        {/* 4 */}
                        <Text style={styles.heading}>4. Product Information</Text>
                        <Text style={styles.paragraph}>
                              We aim to provide accurate product information, including nutritional
                              facts and ingredients; however, formulations may change. Always read
                              product labels, warnings, and directions provided by the manufacturer
                              before consuming any product.
                        </Text>

                        {/* 5 */}
                        <Text style={styles.heading}>5. Health and Wellness</Text>
                        <Text style={styles.paragraph}>
                              Any health-related information on this website is not intended to
                              diagnose, treat, cure, or prevent any disease. Consult a qualified
                              healthcare provider for any health-related questions or concerns.
                        </Text>

                        {/* 6 */}
                        <Text style={styles.heading}>6. Limitation of Liability</Text>
                        <Text style={styles.paragraph}>
                              To the fullest extent permitted by law, HEALTHY TIFFIN and its
                              affiliates, partners, and employees shall not be liable for any direct,
                              indirect, incidental, special, consequential, or punitive damages
                              resulting from the use or inability to use any information or materials
                              on this website.
                        </Text>

                        {/* 7 */}
                        <Text style={styles.heading}>7. External Links</Text>
                        <Text style={styles.paragraph}>
                              This website may contain links to external websites not provided or
                              maintained by HEALTHY TIFFIN. We do not guarantee the accuracy,
                              relevance, or completeness of information on any external websites.
                        </Text>

                        {/* 8 */}
                        <Text style={styles.heading}>8. Changes to This Disclaimer</Text>
                        <Text style={styles.paragraph}>
                              We reserve the right to modify or update this disclaimer at any time
                              without prior notice. Continued use of the website signifies acceptance
                              of any updated terms.
                        </Text>

                        {/* Return & Refund Policy */}
                        <Text style={styles.title}>Return and Refund Policy</Text>

                        <Text style={styles.paragraph}>
                              Please text or email us for any concerns—your satisfaction is our
                              priority!
                        </Text>

                        <Text style={styles.paragraph}>
                              We accept order changes up to one day before your order date. We are
                              unable to accept same-day changes.
                        </Text>

                  </ScrollView>
            </SafeAreaView>
      );
}

const styles = StyleSheet.create({
      wrap: { padding: SPACING * 2, paddingBottom: 30 },
      img: { width: 80, height: 80, alignSelf: 'center', marginVertical: 20 },
      txt: { color: COLORS.black, fontSize: 18, lineHeight: 28 },
      title: {
            fontSize: 24,
            fontWeight: "700",
            marginTop: 25,
            marginBottom: 10,
      },
      heading: {
            fontSize: 17,
            fontWeight: "600",
            marginTop: 18,
            marginBottom: 6,
      },
      paragraph: {
            fontSize: 14,
            lineHeight: 22,
            color: "#444",
      },
});
