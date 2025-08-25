import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { CARTWRAP, COLORS, RADIUS, SPACING } from '../../ui/theme';
import HeaderGreeting from '../../components/HeaderGreeting';
import DayTabs from '../../components/DayTabs';
import HealthMetrics from '../../components/HealthMetrics';

const ProgressScreen: React.FC = () => {
      return (
            <ScrollView bounces={false} style={{ flex: 1, backgroundColor: COLORS.white }}>
                  <HeaderGreeting name="Sam" />
                  < View style={[CARTWRAP]} >
                        <View style={styles.dayTabs}>
                              <DayTabs days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} />
                        </View>
                  </View>
                  <View style={styles.healthMetrics}>
                        <HealthMetrics />
                  </View>
            </ScrollView>
      );
};

export default ProgressScreen;
const styles = StyleSheet.create({
      dayTabs: {
            marginTop: 12,
            backgroundColor: COLORS.white,
            borderRadius: RADIUS,
            padding: SPACING / 2,
      },
      healthMetrics: {
            marginTop: 20,
            backgroundColor: COLORS.white,
            borderRadius: RADIUS,
            padding: SPACING / 2,
            paddingHorizontal: SPACING * 2,

      },
});
