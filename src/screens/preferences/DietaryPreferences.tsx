import React, { useEffect, useMemo, useState } from 'react';
import {
      View,
      Text,
      StyleSheet,
      TouchableOpacity,
      FlatList,
      Image,
      Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import { customerMetafieldUpdate } from '../../shopify/mutation/CustomerAuth';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AppHeader from '../../components/AppHeader';
import { getCustomerMetaField } from '../../shopify/query/CustomerQuery';
import { showToastError, showToastSuccess } from '../../config/ShowToastMessages';
import ContinueIcon from '../../assets/htf-icon/icon-continue.svg';
import CheckIcon from '../../assets/htf-icon/icon-check1.svg'

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Props = { navigation: Nav };

const COLORS = {
      green: '#127E51',
      greenLight: '#0E6C40',
      white: '#FFFFFF',
      text: '#232323',
      subText: '#8e8e8e',
      divider: '#e7e7e7',
      chip: '#E3F0E7',
      disabled: '#BFBFBF',
} as const;

type Item = {
      id: string;
      label: string;
      disabled?: boolean;
      icon?: any; // require(...) or undefined
};

const OPTIONS: Item[] = [
      { id: 'glutenfree', label: 'Gluten Free', }, // desabled: true
      { id: 'vegan', label: 'Vegan' },
      { id: 'vegetarian', label: 'Vegetarian', },
      { id: 'jain', label: 'Jain' },
      { id: 'nonveg', label: 'Non-Vegetarian', },
      { id: 'pescatarian', label: 'Pescatarian' },
      { id: 'eggetarian', label: 'Eggetarian' },
];

const DietaryPreferencesScreen: React.FC<Props> = ({ navigation }) => {
      const user = useSelector((state: RootState) => state.user);
      const [selected, setSelected] = useState<Record<string, boolean>>({
            vegan: true,
            jain: true,
            pescatarian: true,
            eggetarian: true,
      });

      const toggle = (item: Item) => {
            if (item.disabled) return;
            setSelected(s => ({ ...s, [item.id]: !s[item.id] }));
      };

      const canContinue = useMemo(
            () => Object.values(selected).some(Boolean),
            [selected]
      );
      const fetchdata = async () => {
            if (user?.customerToken) {
                  const selectedConditions = await getCustomerMetaField(user?.customerToken, 'dietary');
                  setSelected(JSON.parse(selectedConditions));
            }
      };
      useEffect(() => {
            fetchdata();
      }, []);
      const onsubmit = () => {

            try {
                  const jsonData = JSON.stringify(selected);
                  let response = customerMetafieldUpdate([
                        { key: 'dietary', value: jsonData.replace(/"/g, '\\"'), type: 'multi_line_text_field' },
                  ], user?.id ?? '');
                  response.then(res => {
                        if (res.metafieldsSet.metafields.length > 0) {
                              showToastSuccess('Preferences updated successfully.');
                              navigation.navigate('Home');
                        }
                  });
            } catch (error) {
                  showToastError(error instanceof Error ? error.message : "An error occurred.");
            }

      }

      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
                  {/* Top bar */}
                  <AppHeader title="Dietary Preferences" onBack={() => navigation.goBack()} />


                  <View style={styles.container}>
                        <Text style={styles.hint}>You can select multiple options</Text>

                        <FlatList
                              data={OPTIONS}
                              keyExtractor={i => i.id}
                              contentContainerStyle={{ paddingBottom: 16 }}
                              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                              renderItem={({ item }) => {
                                    const isOn = !!selected[item.id];
                                    const dim = item.disabled;
                                    return (
                                          <TouchableOpacity
                                                activeOpacity={0.8}
                                                onPress={() => toggle(item)}
                                                disabled={dim}
                                                style={[
                                                      styles.row,
                                                      dim && { opacity: 0.6 },
                                                      isOn && { borderColor: COLORS.chip, backgroundColor: '#fff' },
                                                ]}
                                          >
                                                {/* Left check */}
                                                <View style={[styles.check]}>
                                                      {isOn && <CheckIcon height={24} width={24} />}
                                                </View>

                                                {/* Label */}
                                                <Text
                                                      style={[
                                                            styles.label,
                                                            dim && { color: COLORS.subText },
                                                      ]}
                                                >
                                                      {item.label}
                                                </Text>

                                                {/* Right illustrative icon (placeholder emoji fallback) */}
                                                <View style={styles.rightIcon}>
                                                      <Text style={{ fontSize: 22 }}>💪</Text>
                                                </View>
                                          </TouchableOpacity>
                                    );
                              }}
                        />

                        {/* Continue */}
                        <TouchableOpacity
                              activeOpacity={0.9}
                              disabled={!canContinue}
                              style={[styles.ctaBtn, !canContinue && { opacity: 0.5 }]}
                              onPress={() => {
                                    onsubmit();
                              }}
                        >
                              <LinearGradient
                                    colors={[COLORS.green, COLORS.greenLight]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.ctaGradient}
                              >
                                    <Text style={styles.ctaText}>Continue</Text>
                                    <ContinueIcon height={24} width={24} style={{ marginLeft: 8 }} />
                              </LinearGradient>
                        </TouchableOpacity>
                  </View>
            </SafeAreaView>
      );
};

export default DietaryPreferencesScreen;

/* ----------------------- styles ----------------------- */
const styles = StyleSheet.create({


      container: { flex: 1, padding: 16, backgroundColor: COLORS.white },
      hint: { color: COLORS.text, marginBottom: 12, fontWeight: '600' },

      row: {
            height: 66,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.divider,
            backgroundColor: '#fff',
            paddingHorizontal: 14,
            alignItems: 'center',
            flexDirection: 'row',
      },
      check: {
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 1,
            borderColor: COLORS.subText,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            backgroundColor: '#fff',
      },

      label: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '600' },
      rightIcon: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
      },

      ctaBtn: { marginTop: 8 },
      ctaGradient: {
            height: 54,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
      },
      ctaText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
});
