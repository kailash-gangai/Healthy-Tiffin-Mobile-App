import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { CARTWRAP, COLORS, RADIUS, SPACING } from '../../ui/theme';
import HeaderGreeting from '../../components/HeaderGreeting';
import DayTabs from '../../components/DayTabs';
import HealthMetrics from '../../components/HealthMetrics';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getValidTokens } from '../../config/fitbitService';
import { getfitBitData } from '../../config/fitbitService';
import { showToastError } from '../../config/ShowToastMessages';
const items_old = [
      { id: 'steps', label: 'Steps', value: '0', tint: '#E8F2EB', color: '#1E8E5A', image: require('../../assets/icons/running.png'), navigate: 'StepsTracker' },
      { id: 'sleep', label: 'Sleep', value: '0 H 0 M', tint: '#F0E7FA', color: '#7B57C5', image: require('../../assets/icons/moon.webp'), navigate: 'SleepTracker' },
      { id: 'cal', label: 'Calories', value: '0', tint: '#FDF2E3', color: '#F4A300', image: require('../../assets/icons/fire.png'), navigate: 'CaloriesTracker' },
      { id: 'water', label: 'Water', value: '0 Glasses', tint: '#EAF3FB', color: '#2C85D8', image: require('../../assets/icons/water-drops.png'), navigate: 'WaterTracker' }
];
const ProgressScreen: React.FC = () => {
      const navigate = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

      const [accessToken, setAccessToken] = useState<string | null>(null);
      const [items, setItems] = useState(items_old);
      useFocusEffect(
            useCallback(() => {
                  (async () => {
                        const t = await getValidTokens();
                        setAccessToken(t?.accessToken ?? '');
                        if (!t) {
                              navigate.replace("ConnectDevice");
                              return;
                        }
                        try {
                              const s = await getfitBitData(t.accessToken, '');
                              setItems(prev => prev.map(i =>
                                    i.id === "steps" ? { ...i, value: s?.summary?.steps } : i
                              ));

                        } catch (e: any) {
                              showToastError(e instanceof Error ? e.message : "An error occurred.");
                        }
                  })();

            }, [])
      );
      return (
            <ScrollView bounces={false} style={{ flex: 1, backgroundColor: COLORS.white }}>
                  <HeaderGreeting name="Sam" />
                  < View style={[CARTWRAP]} >
                        <View style={styles.dayTabs}>
                              <DayTabs days={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']} />
                        </View>
                  </View>
                  <View style={styles.healthMetrics}>
                        <HealthMetrics items={items} />
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
