import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';
import HomeIcon from '../assets/htf-icon/icon-home.svg';
import ProgressIcon from '../assets/htf-icon/icon-progress (1).svg';
import HeartIcon from '../assets/htf-icon/icon-favorites.svg';
import OrderIcon from '../assets/htf-icon/icon-orders.svg';
import AccountIcon from '../assets/htf-icon/icon-account.svg';

type TabKey = 'progress' | 'favorites' | 'Home' | 'Order' | 'account';
type Props = { active: TabKey; onChange: (k: TabKey) => void; };

const YELLOW = '#FFC107';
const BLACK = '#101010';
const WHITE = '#FFFFFF';

export default function BottomTabs({ active, onChange }: Props) {
      const Item = ({
            k, label, Icon, center = false,
      }: { k: TabKey; label: string; Icon?: React.ComponentType<SvgProps>; center?: boolean }) => {
            const isActive = active === k;
            const stroke = isActive ? YELLOW : WHITE;
            const fill = isActive ? YELLOW : 'none';
            

            if (center) {
                  return (
                        <TouchableOpacity onPress={() => onChange(k)} activeOpacity={0.85} style={s.centerWrap}>
                              <View style={[s.centerBtn, isActive && s.centerBtnOn]}>
                                    <HomeIcon width={30} height={30} />
                              </View>
                        </TouchableOpacity>
                  );
            }

            const Ico = Icon!;
            return (
                  <TouchableOpacity onPress={() => onChange(k)} activeOpacity={0.85} style={s.item}>
                        <View style={s.iconWrap}>
                              <Ico width={30} height={30} color={stroke} stroke={stroke} fill={fill} />
                        </View>
                        <Text style={[s.label, isActive && s.labelOn]}>{label}</Text>
                  </TouchableOpacity>
            );
      };

      return (
            <SafeAreaView style={s.safe} edges={['bottom'] as any}>
                  <View style={s.bar}>
                        <Item k="progress" label="Progress" Icon={ProgressIcon} />
                        <Item k="favorites" label="Favorites" Icon={HeartIcon} />
                        <Item k="Home" label="Home" center />
                        <Item k="Order" label="Orders" Icon={OrderIcon} />
                        <Item k="account" label="Account" Icon={AccountIcon} />
                  </View>
            </SafeAreaView>
      );
}

const s = StyleSheet.create({
      safe: { backgroundColor: BLACK },
      bar: { height: 64, backgroundColor: BLACK, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
      item: { alignItems: 'center', justifyContent: 'center', width: 70 },
      iconWrap: { marginBottom: 4 },
      label: { color: WHITE, fontSize: 12 },
      centerWrap: { alignItems: 'center', justifyContent: 'center', width: 90 },
      centerBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: YELLOW, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
      centerBtnOn: { backgroundColor: YELLOW },
      centerLabel: { color: WHITE, fontSize: 12 },
      labelOn: { color: YELLOW, fontWeight: '700' },
});
