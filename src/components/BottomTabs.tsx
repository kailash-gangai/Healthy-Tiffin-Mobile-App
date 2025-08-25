import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5'
import { SafeAreaView } from 'react-native-safe-area-context';
import Fontisto from '@react-native-vector-icons/fontisto';

type TabKey = 'progress' | 'favorites' | 'home' | 'orders' | 'account';

type Props = {
      active: TabKey;
      onChange: (k: TabKey) => void;
};

const YELLOW = '#FFC107';
const BLACK = '#101010';
const WHITE = '#FFFFFF';

export default function BottomTabs({ active, onChange }: Props) {
      const Item = ({
            k,
            label,
            icon,
            center = false,
      }: {
            k: TabKey;
            label: string;
            icon: React.ReactNode;
            center?: boolean;
      }) => {
            const isActive = active === k;
            if (center) {
                  return (

                        <TouchableOpacity onPress={() => onChange(k)} activeOpacity={0.85} style={s.centerWrap}>
                              <View style={[s.centerBtn, isActive && s.centerBtnOn]}>
                                    <FontAwesome5 iconStyle='solid' name="home" size={22} color={BLACK} />
                              </View>
                              {/* <Text style={[s.label, isActive && s.labelOn]}>{label}</Text> */}
                        </TouchableOpacity>
                  );
            }
            return (

                  <TouchableOpacity onPress={() => onChange(k)} activeOpacity={0.85} style={s.item}>
                        <View style={s.iconWrap}>
                              {/* clone icon and apply active color */}
                              {React.cloneElement(icon as any, {
                                    color: isActive ? YELLOW : WHITE,
                              })}
                        </View>
                        <Text style={[s.label, isActive && s.labelOn]}>{label}</Text>
                  </TouchableOpacity>
            );
      };

      return (
            <SafeAreaView style={s.safe} edges={['bottom'] as any}>
                  <View style={s.bar}>
                        <Item
                              k="progress"
                              label="Progress"
                              icon={<FontAwesome5 iconStyle='solid' name="tachometer-alt" size={22} color={WHITE} />}
                        />
                        <Item
                              k="favorites"
                              label="Favorites"
                              icon={<FontAwesome5 name="heart" size={22} color={WHITE} />}
                        />
                        <Item k="home" label="Home" icon={null} center />
                        <Item
                              k="orders"
                              label="Orders"
                              icon={<FontAwesome5 iconStyle='solid' name="file-invoice" size={20} color={WHITE} />}
                        />
                        <Item
                              k="account"
                              label="Account"
                              icon={<Fontisto name="player-settings" size={22} color={WHITE} />}
                        />
                  </View>
            </SafeAreaView>
      );
}

const s = StyleSheet.create({
      safe: { backgroundColor: BLACK },
      bar: {
            height: 64,
            backgroundColor: BLACK,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
      },

      item: { alignItems: 'center', justifyContent: 'center', width: 70 },
      iconWrap: { marginBottom: 4 },
      label: { color: WHITE, fontSize: 12 },

      centerWrap: { alignItems: 'center', justifyContent: 'center', width: 90 },
      centerBtn: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: YELLOW,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
      },
      centerBtnOn: { backgroundColor: YELLOW },
      centerLabel: { color: WHITE, fontSize: 12 },
      labelOn: { color: YELLOW, fontWeight: '700' },

});
