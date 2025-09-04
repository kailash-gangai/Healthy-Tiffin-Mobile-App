import React, { useEffect, useMemo, useState } from 'react';
import {
      View,
      Text,
      StyleSheet,
      TouchableOpacity,
      TextInput,
      Modal,
      FlatList,

      Platform,
      Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesome5 } from '@react-native-vector-icons/fontawesome5';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../ui/theme';
import AppHeader from '../../components/AppHeader';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { customerMetafieldUpdate } from '../../shopify/mutation/CustomerAuth';
import { getCustomerMetaField, getCustomerMetafields } from '../../shopify/query/CustomerQuery';
import { getMetaObjectByHandle } from '../../shopify/queries/getMetaObject';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Props = { navigation: Nav };

const ages = Array.from({ length: 83 }, (_, i) => `${i + 18}`); // 18..100
const genders = ['Male', 'Female', 'Other'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];


const SelectPreferencesScreen: React.FC<Props> = ({ navigation }) => {
      const user = useSelector((state: RootState) => state.user);
      const [gender, setGender] = useState<string>('');
      const [age, setAge] = useState<string>('');
      const [level, setLevel] = useState<string>('');

      const [curWeight, setCurWeight] = useState<string>(''); // lbs
      const [goalWeight, setGoalWeight] = useState<string>(''); // lbs
      const [feet, setFeet] = useState<string>(''); // ft
      const [inches, setInches] = useState<string>(''); // in

      useEffect(() => {
            const fetchdata = async () => {
                  if (user?.customerToken) {
                        setGender(await getCustomerMetaField(user?.customerToken, 'gender'));
                        setAge(await getCustomerMetaField(user?.customerToken, 'age'));
                        setLevel(await getCustomerMetaField(user?.customerToken, 'fitness_level'));
                        setCurWeight(await getCustomerMetaField(user?.customerToken, 'cur_weight'));
                        setGoalWeight(await getCustomerMetaField(user?.customerToken, 'goal_weight'));
                        let height = await getCustomerMetaField(user?.customerToken, 'height');
                        height = height.replace("'", '-');
                        setFeet(height.split('-')[0]);
                        setInches(height.split('-')[1]);
                  }

            };

            fetchdata(); // call the function
      }, []);

      const bmi = useMemo(() => {
            const w = parseFloat(curWeight);
            const hIn = parseFloat(feet || '0') * 12 + parseFloat(inches || '0');
            if (!w || !hIn) return NaN;
            return Math.round((703 * w / (hIn * hIn)) * 10) / 10; // 1 decimal
      }, [curWeight, feet, inches]);

      const canContinue =
            gender && age && level &&
            parseFloat(curWeight) > 0 &&
            parseFloat(goalWeight) > 0 &&
            (parseFloat(feet) > 0 || parseFloat(inches) > 0);

      const onsubmit = () => {
            try {
                  let response = customerMetafieldUpdate([
                        { key: 'gender', value: gender, type: 'single_line_text_field' },
                        { key: 'age', value: age, type: 'single_line_text_field' },
                        { key: 'fitness_level', value: level, type: 'single_line_text_field' },
                        { key: 'cur_weight', value: curWeight, type: 'single_line_text_field' },
                        { key: 'goal_weight', value: goalWeight, type: 'single_line_text_field' },
                        { key: 'height', value: `${feet}'${inches}`, type: 'single_line_text_field' },
                        { key: 'bmi', value: `${bmi}`, type: 'single_line_text_field' },
                  ], user?.id ?? '');
                  response.then(res => {
                        if (res.metafieldsSet.metafields.length > 0) {
                              navigation.navigate('MedicalPreferences');
                        }
                  });
            } catch (error) {
                  if (error instanceof Error) {
                        Alert.alert("Error", error.message);
                  } else {
                        Alert.alert("Error", "An error occurred.");
                  }
            }

      }

      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                  {/* Top bar */}
                  <AppHeader
                        title="Select Preferences"
                        onBack={() => navigation.goBack()}
                  />
                  {/* <View style={styles.topbar}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                              <FontAwesome5 iconStyle='solid' name="chevron-left" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                        <Text style={styles.topTitle}>Select Preferences</Text>
                        <View style={{ width: 24 }} />
                  </View> */}

                  <View style={styles.container}>
                        {/* Gender */}
                        <Text style={styles.label}>Select Gender</Text>
                        <SelectField
                              value={gender}
                              placeholder="Select"
                              options={genders}
                              onSelect={setGender}
                        />

                        {/* Age */}
                        <Text style={[styles.label, { marginTop: 16 }]}>Select Your Age</Text>
                        <SelectField
                              value={age}
                              placeholder="Select"
                              options={ages}
                              onSelect={setAge}
                        />

                        {/* Fitness level */}
                        <Text style={[styles.label, { marginTop: 16 }]}>Select Fitness Level</Text>
                        <SelectField
                              value={level}
                              placeholder="Select"
                              options={levels}
                              onSelect={setLevel}
                        />

                        {/* Current weight */}
                        <Text style={[styles.label, { marginTop: 16 }]}>Current Weight</Text>
                        <UnitInput
                              value={curWeight}
                              onChangeText={t => setCurWeight(t.replace(/[^\d.]/g, ''))}
                              keyboardType={Platform.select({ ios: 'number-pad', android: 'numeric' })}
                              unit="Lbs"
                        />

                        {/* Weight goal */}
                        <Text style={[styles.label, { marginTop: 16 }]}>Weight Goal</Text>
                        <UnitInput
                              value={goalWeight}
                              onChangeText={t => setGoalWeight(t.replace(/[^\d.]/g, ''))}
                              keyboardType={Platform.select({ ios: 'number-pad', android: 'numeric' })}
                              unit="Lbs"
                        />

                        {/* Height */}
                        <Text style={[styles.label, { marginTop: 16 }]}>Select Your Height</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                              <UnitInput
                                    style={{ flex: 1 }}
                                    value={feet}
                                    onChangeText={t => setFeet(t.replace(/[^\d]/g, ''))}
                                    keyboardType={Platform.select({ ios: 'number-pad', android: 'numeric' })}
                                    unit="ft"
                                    maxLength={1}
                              />
                              <UnitInput
                                    style={{ flex: 1 }}
                                    value={inches}
                                    onChangeText={t => setInches(t.replace(/[^\d]/g, ''))}
                                    keyboardType={Platform.select({ ios: 'number-pad', android: 'numeric' })}
                                    unit="in"
                                    maxLength={2}
                              />
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* BMI card */}
                        <Text style={styles.bmiTitle}>Your current BMI</Text>
                        <View style={styles.bmiCard}>
                              <Text style={styles.bmiLeft}>Ideal</Text>
                              <Text style={styles.bmiRight}>{Number.isNaN(bmi) ? '--' : bmi.toFixed(1)}</Text>
                        </View>

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
                                    <FontAwesome5 iconStyle='solid' name="sign-in-alt" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
                              </LinearGradient>
                        </TouchableOpacity>
                  </View>
            </SafeAreaView>
      );
};

export default SelectPreferencesScreen;


/* ---------- SelectField (modal dropdown) ---------- */
const SelectField = ({
      value,
      placeholder,
      options,
      onSelect,
}: {
      value?: string;
      placeholder?: string;
      options: string[];
      onSelect: (v: string) => void;
}) => {
      const [open, setOpen] = useState(false);
      return (
            <>
                  <TouchableOpacity activeOpacity={0.8} style={styles.select} onPress={() => setOpen(true)}>
                        <Text style={[styles.selectText, !value && { color: COLORS.subText }]}>
                              {value || placeholder || 'Select'}
                        </Text>
                        <FontAwesome5 iconStyle='solid' name="chevron-down" size={16} color={COLORS.subText} />
                  </TouchableOpacity>

                  <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                        <TouchableOpacity style={styles.modalBackdrop} onPress={() => setOpen(false)} />
                        <View style={styles.sheet}>
                              <FlatList
                                    data={options}
                                    keyExtractor={(i) => i}
                                    renderItem={({ item }) => (
                                          <TouchableOpacity
                                                style={styles.option}
                                                onPress={() => {
                                                      onSelect(item);
                                                      setOpen(false);
                                                }}
                                          >
                                                <Text style={styles.optionText}>{item}</Text>
                                          </TouchableOpacity>
                                    )}
                              />
                        </View>
                  </Modal>
            </>
      );
};

/* ---------- UnitInput (text + unit badge) ---------- */
const UnitInput = ({
      unit,
      style,
      ...rest
}: {
      unit: string;
      style?: any;
} & React.ComponentProps<typeof TextInput>) => (
      <View style={[styles.inputWrap, style]}>
            <TextInput
                  {...rest}
                  style={styles.input}
                  placeholderTextColor={COLORS.subText}
            />
            <View style={styles.unitBadge}>
                  <Text style={styles.unitText}>{unit}</Text>
            </View>
      </View>
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
      back: {
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
      },
      topTitle: { flex: 1, textAlign: 'center', color: COLORS.white, fontWeight: '700', fontSize: 16 },

      container: { flex: 1, padding: 16, backgroundColor: COLORS.white },
      label: { color: COLORS.black, marginBottom: 8, fontWeight: '600' },

      select: {
            height: 56,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.divider,
            paddingHorizontal: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
            backgroundColor: '#fff',
      },
      selectText: { fontSize: 16, color: COLORS.black },

      inputWrap: {
            height: 56,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.divider,
            backgroundColor: '#fff',
            paddingLeft: 16,
            paddingRight: 74,
            justifyContent: 'center',
      },
      input: { fontSize: 16, color: COLORS.black },
      unitBadge: {
            position: 'absolute',
            right: 8,
            top: 8,
            bottom: 8,
            width: 56,
            borderRadius: 10,
            backgroundColor: COLORS.chip,
            alignItems: 'center',
            justifyContent: 'center',
      },
      unitText: { color: COLORS.green, fontWeight: '700' },

      divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: 18 },

      bmiTitle: { fontSize: 18, fontWeight: '700', color: COLORS.black, marginBottom: 8 },
      bmiCard: {
            height: 56,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.divider,
            backgroundColor: '#fff',
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
      },
      bmiLeft: { color: COLORS.subText, fontWeight: '600' },
      bmiRight: { color: COLORS.black, fontWeight: '800', fontSize: 18 },

      ctaBtn: { marginTop: 22 },
      ctaGradient: {
            height: 54,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
      },
      ctaText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },

      modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
      sheet: {
            position: 'absolute',
            left: 16,
            right: 16,
            top: '25%',
            maxHeight: '50%',
            backgroundColor: '#fff',
            borderRadius: 14,
            paddingVertical: 8,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
      },
      option: { paddingVertical: 14, paddingHorizontal: 16 },
      optionText: { fontSize: 16, color: COLORS.black },
});
