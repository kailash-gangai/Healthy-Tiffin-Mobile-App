import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinkRow from '../../components/LinkRow';
import AppHeader from '../../components/AppHeader';

export default function AboutProfile({ navigation }: any) {
      return (

            <SafeAreaView style={s.safe}>
                  <AppHeader title="About" onBack={() => navigation.goBack()} />
                  <View style={s.wrap}>
                        <LinkRow
                              label="Privacy Policy"
                              icon="lock"
                              onPress={() => navigation.navigate('PrivacyPolicy')}
                        />
                        <LinkRow
                              label="Terms of Service"
                              icon="book"
                              onPress={() => navigation.navigate('TermsOfService')}
                        />
                  </View>
            </SafeAreaView>

      );
}

const s = StyleSheet.create({
      safe: { flex: 1, backgroundColor: '#FFFFFF' },
      wrap: { padding: 16 },
});
