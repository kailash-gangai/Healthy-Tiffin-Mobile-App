import React, { useEffect, useMemo, useState } from 'react';
import {
      View,
      Text,
      StyleSheet,
      TouchableOpacity,
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

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Props = { navigation: Nav };

const COLORS = {
      green: '#0B5733',
      greenLight: '#0E6C40',
      white: '#FFFFFF',
      text: '#232323',
      subText: '#8e8e8e',
      divider: '#e7e7e7',
      chip: '#F5F5F5',
      warn: '#F4A300',
      warnText: '#ffffff',
} as const;

const CONDITIONS = [
      'Acid Reflux',
      'High blood pressure',
      'Diabetic',
      'PCOS',
      'Thyroid',
      'Premenopause',
      'other',
];

const MedicalPreferencesScreen: React.FC<Props> = ({ navigation }) => {
      const user = useSelector((state: RootState) => state.user);
      const [hasCondition, setHasCondition] = useState<boolean | null>(true);
      const [selected, setSelected] = useState<Record<string, boolean>>({});

      const toggleChip = (label: string) => {
            if (!hasCondition) return;
            setSelected(s => ({ ...s, [label]: !s[label] }));
      };

      const canContinue = useMemo(
            () => hasCondition !== null && (!hasCondition || Object.values(selected).some(Boolean)),
            [hasCondition, selected]
      );
      const fetchdata = async () => {
            if (user?.customerToken) {
                  const hasCondition = await getCustomerMetaField(user?.customerToken, 'has_condition');
                  setHasCondition(hasCondition === 'true' ? true : false);
                  const selectedConditions = await getCustomerMetaField(user?.customerToken, 'condition');
                  setSelected(JSON.parse(selectedConditions));
                  // setSelected(await getCustomerMetaField(user?.customerToken, 'condition'));
            }

      };
      const onSelectYN = (val: boolean) => {
            setHasCondition(val);
            if (!val) setSelected({});
            // if (val) {
            //       fetchdata();
            // }
      };
      useEffect(() => {

            fetchdata();
      }, []);

      const onsubmit = () => {

            try {
                  const jsonData = JSON.stringify(selected);
                  let response = customerMetafieldUpdate([
                        { key: 'has_condition', value: hasCondition, type: 'boolean' },
                        { key: 'condition', value: jsonData.replace(/"/g, '\\"'), type: 'multi_line_text_field' },
                  ], user?.id ?? '');

                  response.then(res => {
                        if (res.metafieldsSet.metafields.length > 0) {
                              showToastSuccess('Preferences updated successfully.');
                              navigation.navigate('DietaryPreferences');
                        }
                  });
            } catch (error) {
                  showToastError(error instanceof Error ? error.message : "An error occurred.");
            }

      }


      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
                  {/* Top bar */}
                  <AppHeader title="Medical Preferences" onBack={() => navigation.goBack()} />
                  {/* <View style={styles.topbar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                              <FontAwesome5 iconStyle='solid' name="chevron-left" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.topTitle}>Medical Preferences</Text>
                        <View style={{ width: 24 }} />
                  </View> */}

                  <View style={styles.container}>
                        <Text style={styles.sectionTitle}>Any existing health conditions or injuries</Text>
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                              <YN
                                    label="Yes"
                                    active={hasCondition === true}
                                    onPress={() => onSelectYN(true)}
                              />
                              <YN
                                    label="No"
                                    active={hasCondition === false}
                                    onPress={() => onSelectYN(false)}
                              />
                        </View>

                        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Select your medical preferences</Text>
                        <View style={styles.chipsWrap}>
                              {CONDITIONS.map(label => {
                                    const isOn = !!selected[label];
                                    const isWarn = CONDITIONS.includes(label) && isOn;
                                    return (
                                          <TouchableOpacity
                                                key={label}
                                                activeOpacity={0.8}
                                                onPress={() => toggleChip(label)}
                                                disabled={!hasCondition}
                                                style={[
                                                      styles.chip,
                                                      isOn && !isWarn && styles.chipOn,
                                                      isWarn && styles.chipWarn,
                                                      !hasCondition && { opacity: 0.5 },
                                                ]}
                                          >
                                                <Text
                                                      style={[
                                                            styles.chipText,
                                                            isOn && !isWarn && { color: COLORS.green, fontWeight: '700' },
                                                            isWarn && { color: COLORS.warnText, fontWeight: '700' },
                                                      ]}
                                                >
                                                      {label}
                                                </Text>
                                          </TouchableOpacity>
                                    );
                              })}
                        </View>

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
                                    <FontAwesome5 iconStyle='solid' name="sign-in-alt" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
                              </LinearGradient>
                        </TouchableOpacity>
                  </View>
            </SafeAreaView>
      );
};

export default MedicalPreferencesScreen;

/* ---------- Subcomponents ---------- */
const YN = ({
      label,
      active,
      onPress,
}: {
      label: string;
      active: boolean;
      onPress: () => void;
}) => (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.yn, active && styles.ynOn]}>
            <View style={[styles.dot, active && styles.dotOn]} />
            <Text style={[active && { color: COLORS.text, fontWeight: '700' }]}>{label}</Text>
      </TouchableOpacity>
);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
      topbar: {
            height: 48,
            backgroundColor: COLORS.green,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
      },
      back: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
      topTitle: { flex: 1, textAlign: 'center', color: COLORS.white, fontWeight: '700', fontSize: 16 },

      container: { flex: 1, padding: 16, backgroundColor: COLORS.white },
      sectionTitle: { color: COLORS.text, fontWeight: '700' },

      yn: {
            height: 44,
            paddingHorizontal: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: COLORS.divider,
            backgroundColor: '#fff',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
      },
      ynOn: { borderColor: COLORS.chip, backgroundColor: '#fff' },
      dot: {
            width: 18,
            height: 18,
            borderRadius: 9,
            borderWidth: 1,
            borderColor: COLORS.subText,
      },
      dotOn: { borderColor: COLORS.green, backgroundColor: COLORS.green },

      chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
      chip: {
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.divider,
            backgroundColor: COLORS.white,
      },
      chipOn: { borderColor: COLORS.green + '33', backgroundColor: '#F7FFF9' },
      chipWarn: { backgroundColor: COLORS.warn, borderColor: COLORS.warn },
      chipText: { color: COLORS.text },

      ctaBtn: { marginTop: 24 },
      ctaGradient: {
            height: 54,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
      },
      ctaText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
});
