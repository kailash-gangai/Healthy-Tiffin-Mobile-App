import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinkRow from '../../components/LinkRow';
import AppHeader from '../../components/AppHeader';
import PolicyIconb from '../../assets/htf-icon/icon-award.svg';
import TermsIcon from '../../assets/htf-icon/icon-note-award.svg';

export default function AboutProfile({ navigation }: any) {
      return (

            <SafeAreaView style={s.safe}>
                  <AppHeader title="About" onBack={() => navigation.goBack()} />
                  <View style={s.wrap}>
                        <LinkRow
                              label="Privacy Policy"
                              icon={<PolicyIconb width={30} height={30} />}
                              onPress={() => navigation.navigate('PrivacyPolicy')}
                        />
                        <LinkRow
                              label="Terms of Service"
                              icon={<TermsIcon width={30} height={30} />}
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
