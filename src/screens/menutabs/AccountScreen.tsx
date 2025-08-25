import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { COLORS, SPACING } from '../../ui/theme';
import HeaderGreeting from '../../components/HeaderGreeting';

const AccountScreen: React.FC = () => {

      return (
            <View style={{ flex: 1, backgroundColor: COLORS.white }}>
                  <ScrollView bounces={false}>
                        <HeaderGreeting name="Sam" />
                        <Text>Account</Text>
                  </ScrollView>
            </View>
      );
};

export default AccountScreen;
const styles = StyleSheet.create({

});
