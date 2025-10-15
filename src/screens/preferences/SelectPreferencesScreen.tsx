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
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { RootStackParamList } from '../navigation/types';
import { COLORS } from '../../ui/theme';
import AppHeader from '../../components/AppHeader';
import { RootState } from '../../store';
import { customerMetafieldUpdate } from '../../shopify/mutation/CustomerAuth';
import { getCustomerMetaField } from '../../shopify/query/CustomerQuery';
import {
  showToastError,
  showToastSuccess,
} from '../../config/ShowToastMessages';
import ContinueIcon from '../../assets/htf-icon/icon-continue.svg';
import ArrowDown from '../../assets/htf-icon/icon-down-arrow.svg';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Props = { navigation: Nav };

const ages = Array.from({ length: 83 }, (_, i) => `${i + 18}`); // 18..100
const genders = ['Male', 'Female', 'Other'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

const SelectPreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
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
      if (!user?.customerToken) return;
      try {
        setGender(await getCustomerMetaField(user.customerToken, 'gender'));
        setAge(await getCustomerMetaField(user.customerToken, 'age'));
        setLevel(
          await getCustomerMetaField(user.customerToken, 'fitness_level'),
        );
        setCurWeight(
          await getCustomerMetaField(user.customerToken, 'cur_weight'),
        );
        setGoalWeight(
          await getCustomerMetaField(user.customerToken, 'goal_weight'),
        );

        const rawHeight = await getCustomerMetaField(
          user.customerToken,
          'height',
        );
        if (rawHeight) {
          const norm = String(rawHeight).replace("'", '-');
          const [ft = '', inch = ''] = norm.split('-');
          setFeet(ft);
          setInches(inch);
        }
      } catch (e) {
        // no-op
      }
    };
    fetchdata();
  }, [user]);

  const bmi = useMemo(() => {
    const w = parseFloat(curWeight);
    const hIn = parseFloat(feet || '0') * 12 + parseFloat(inches || '0');
    if (!w || !hIn) return NaN;
    return Math.round(((703 * w) / (hIn * hIn)) * 10) / 10;
  }, [curWeight, feet, inches]);

  const canContinue =
    !!gender &&
    !!age &&
    !!level &&
    parseFloat(curWeight) > 0 &&
    parseFloat(goalWeight) > 0 &&
    (parseFloat(feet) > 0 || parseFloat(inches) > 0);

  const onsubmit = () => {
    try {
      customerMetafieldUpdate(
        [
          { key: 'gender', value: gender, type: 'single_line_text_field' },
          { key: 'age', value: age, type: 'single_line_text_field' },
          {
            key: 'fitness_level',
            value: level,
            type: 'single_line_text_field',
          },
          {
            key: 'cur_weight',
            value: curWeight,
            type: 'single_line_text_field',
          },
          {
            key: 'goal_weight',
            value: goalWeight,
            type: 'single_line_text_field',
          },
          {
            key: 'height',
            value: `${feet}'${inches}`,
            type: 'single_line_text_field',
          },
          { key: 'bmi', value: `${bmi}`, type: 'single_line_text_field' },
        ],
        user?.id ?? '',
      ).then(res => {
        if (res?.metafieldsSet?.metafields?.length > 0) {
          showToastSuccess('Preferences updated successfully.');
          navigation.navigate('MedicalPreferences');
        }
      });
    } catch (error) {
      showToastError(
        error instanceof Error ? error.message : 'An error occurred.',
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <AppHeader
        title="Select Preferences"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: 140 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>Select Gender</Text>
            <SelectField
              value={gender}
              placeholder="Select"
              options={genders}
              onSelect={setGender}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>
              Select Your Age
            </Text>
            <SelectField
              value={age}
              placeholder="Select"
              options={ages}
              onSelect={setAge}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>
              Select Fitness Level
            </Text>
            <SelectField
              value={level}
              placeholder="Select"
              options={levels}
              onSelect={setLevel}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>
              Current Weight
            </Text>
            <UnitInput
              value={curWeight}
              onChangeText={t => setCurWeight(t.replace(/[^\d.]/g, ''))}
              keyboardType={Platform.select({
                ios: 'number-pad',
                android: 'numeric',
              })}
              unit="Lbs"
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Weight Goal</Text>
            <UnitInput
              value={goalWeight}
              onChangeText={t => setGoalWeight(t.replace(/[^\d.]/g, ''))}
              keyboardType={Platform.select({
                ios: 'number-pad',
                android: 'numeric',
              })}
              unit="Lbs"
            />

            <Text style={[styles.label, { marginTop: 16 }]}>
              Select Your Height
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <UnitInput
                style={{ flex: 1 }}
                value={feet}
                onChangeText={t => setFeet(t.replace(/[^\d]/g, ''))}
                keyboardType={Platform.select({
                  ios: 'number-pad',
                  android: 'numeric',
                })}
                unit="ft"
                maxLength={1}
              />
              <UnitInput
                style={{ flex: 1 }}
                value={inches}
                onChangeText={t => setInches(t.replace(/[^\d]/g, ''))}
                keyboardType={Platform.select({
                  ios: 'number-pad',
                  android: 'numeric',
                })}
                unit="in"
                maxLength={2}
              />
            </View>

            <View style={styles.divider} />

            <Text style={styles.bmiTitle}>Your current BMI</Text>
            <View style={styles.bmiCard}>
              <Text style={styles.bmiLeft}>Ideal</Text>
              <Text style={styles.bmiRight}>
                {Number.isNaN(bmi) ? '--' : bmi.toFixed(1)}
              </Text>
            </View>
          </ScrollView>

          <View
            style={[
              styles.ctaWrap,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!canContinue}
              style={[styles.ctaBtn, !canContinue && { opacity: 0.5 }]}
              onPress={onsubmit}
            >
              <LinearGradient
                colors={[COLORS.green, COLORS.greenLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Continue</Text>
                <ContinueIcon
                  height={24}
                  width={24}
                  style={{ marginLeft: 8 }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.select}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.selectText, !value && { color: COLORS.subText }]}>
          {value || placeholder || 'Select'}
        </Text>
        <ArrowDown />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={() => setOpen(false)}
        />
        <View style={styles.sheet}>
          <FlatList
            data={options}
            keyExtractor={i => i}
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
            showsVerticalScrollIndicator={false}
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
  },

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

  bmiTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
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

  ctaWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  ctaBtn: {},
  ctaGradient: {
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  ctaText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
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
