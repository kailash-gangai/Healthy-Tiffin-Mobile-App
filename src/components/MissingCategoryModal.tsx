// components/MissingCategoryModal.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { COLORS as C, SHADOW } from '../ui/theme';
import Calender from '../assets/htf-icon/icon-callendar.svg';
import TrashIcon from '../assets/htf-icon/icon-trans.svg';
import AddIcon from '../assets/htf-icon/icon-add.svg';
import InfoIcon from '../assets/htf-icon/icon-info.svg';
import Tiffin from '../assets/htf-icon/icon-myorder.svg';
import CrossIcon from '../assets/htf-icon/icon-cross.svg';
import { useAppSelector } from '../store/hooks';
import { applyPriceThresholds } from '../utils/tiffinHelpers';

type CatalogItem = {
  id: string;
  variantId: string;
  title: string;
  description: string;
  tags: string[];
  image: string | null;
  price: string | number;
};

type CatalogGroup = {
  key: 'probiotics' | 'proteins' | 'sides' | 'veggies';
  value: CatalogItem[];
};

type MissingRow = { date: string; tiffinPlan: number; missing: string[] };

export default function MissingCategoryModal({
  visible,
  onClose,
  dataByDate,
  missingList,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  dataByDate: Partial<Record<string, CatalogGroup[]>>; // Updated to use date (string)
  missingList: MissingRow[];
  onAdd: (payload: {
    id: string;
    variantId: string;
    title: string;
    description?: string;
    tags?: string[];
    image: string | null;
    price: string | number;
    type: 'main';
    category: string;
    qty: number;
    date: string;
    tiffinPlan: number;
  }) => void;
}) {
  const { raw } = useAppSelector(state => state.price);
  const dates = useMemo(
    () => Array.from(new Set(missingList.map(m => m.date))),
    [missingList],
  );
  const [date, setDate] = useState<string>(dates[0] || '2025-12-01');

  const plansForDate = useMemo(
    () =>
      missingList
        .filter(m => m.date === date)
        .map(m => m.tiffinPlan)
        .sort((a, b) => a - b),
    [missingList, date],
  );

  const [plan, setPlan] = useState<number>(plansForDate[0] || 1);

  const missingCats = useMemo(() => {
    const row = missingList.find(m => m.date === date && m.tiffinPlan === plan);
    return (row?.missing ?? []).map(s => String(s).toUpperCase());
  }, [missingList, date, plan]);

  const _groups = useMemo(() => {
    // console.log('dataByDate', dataByDate);
  }, [dataByDate, date, missingCats]);

  const groups = applyPriceThresholds(_groups as any, raw);

  const Chip = ({
    label,
    active,
    icon,
    iconComponent,
    onPress,
  }: {
    label: string;
    active: boolean;
    icon?: string;
    iconComponent?: React.ReactNode;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: active ? '#1E874B' : '#D8DCD9',
        backgroundColor: active ? '#1E874B' : '#F4F5F4',
        minHeight: 36,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        {iconComponent ?? (
          <FontAwesome5
            name={icon}
            size={13}
            color={active ? '#FFFFFF' : '#1E874B'}
          />
        )}

        <Text
          numberOfLines={1}
          style={{
            fontSize: 12,
            fontWeight: '600',
            color: active ? '#FFFFFF' : '#1E874B',
          }}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.backdrop}>
        <View style={s.sheet}>
          <TouchableOpacity onPress={onClose} style={s.grabberWrap}>
            <View style={s.grabber} />
          </TouchableOpacity>

          <View style={s.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.h1}>Finish your box</Text>
              <Text style={s.subH}>
                {date} • Tiffin {plan}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={s.iconBtn}
            >
              <CrossIcon width={25} height={25} />
            </TouchableOpacity>
          </View>

          <View>
            {/* date selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.rowChips}
            >
              {dates.map(d => (
                <Chip
                  key={d + plan + date}
                  label={d}
                  active={d === date}
                  iconComponent={<Calender width={12} height={12} />}
                  onPress={() => {
                    setDate(d);
                    const first =
                      missingList.find(m => m.date === d)?.tiffinPlan ?? 1;
                    setPlan(first);
                  }}
                />
              ))}
            </ScrollView>

            {/* plan selector */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[s.rowChips]}
            >
              {plansForDate.map(p => (
                <Chip
                  key={p}
                  label={`Tiffin ${p}`}
                  active={p === plan}
                  iconComponent={<Tiffin width={12} height={12} />}
                  onPress={() => setPlan(p)}
                />
              ))}
            </ScrollView>
          </View>

          {/* notice */}
          <View style={s.notice}>
            <InfoIcon width={14} height={14} />
            {missingCats.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.missRow}
              >
                {missingCats.map(c => (
                  <View key={c} style={s.missPill}>
                    <Text style={s.missPillTxt} numberOfLines={1}>
                      {c}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={s.allSet}>All set for this tiffin.</Text>
            )}
          </View>

          {/* suggestions */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
            {groups.map(g => (
              <View key={g.key}>
                <View style={s.groupHdr}>
                  <Text style={s.groupTitle}>
                    {String(g.key).toUpperCase()}
                  </Text>
                </View>

                {g.value.map(it => (
                  <View key={`${it.id}-${it.variantId}`} style={s.cardSm}>
                    <View style={s.imgWrap}>
                      <Image
                        source={
                          it.image
                            ? { uri: it.image }
                            : require('../assets/LOGO.png')
                        }
                        style={s.imgSm}
                      />
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={s.itemTitle} numberOfLines={2}>
                        {it.title}
                      </Text>
                      {Number(it.price) > 0 ? (
                        <Text style={{ marginTop: 4, fontSize: 12, color: C.subText }}>
                          +{'('}${it.price}
                          {')'}
                        </Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      style={s.addBtnSm}
                      activeOpacity={0.92}
                      onPress={() =>
                        onAdd({
                          id: it.id,
                          variantId: it.variantId,
                          title: it.title,
                          description: it.description,
                          tags: it.tags,
                          image: it.image,
                          price: it.price,
                          type: 'main',
                          category: String(g.key).toUpperCase(),
                          qty: 1,
                          date,
                          tiffinPlan: plan,
                        })
                      }
                    >
                      <AddIcon width={17} height={17} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}

            {!groups.length && (
              <View style={s.empty}>
                <TrashIcon width={16} height={16} />
                <Text style={s.emptyTxt}>
                  No suggestions for selected tiffin.
                </Text>
              </View>
            )}
          </ScrollView>

        </View>

      </View>
    </Modal>
  );
}




const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 6,
  },

  grabberWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#DADADA',
  },

  // Header
  headerRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  h1: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
  },
  subH: {
    marginTop: 4,
    color: '#707070',
    fontSize: 12,
    fontWeight: '600',
  },

  iconBtn: {
    padding: 6,
    backgroundColor: '#F4F4F4',
    borderRadius: 999,
  },

  // Day / Date Chips
  rowChips: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 8,
  },
  chipBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,

  },

  chipInactive: {
    backgroundColor: '#F4F5F4',
    borderColor: '#D8DCD9',
  },

  chipActive: {
    backgroundColor: '#1E874B',
    borderColor: '#1E874B',
  },

  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 12,
  },

  chipLabelInactive: {
    color: '#1E874B',
  },

  chipLabelActive: {
    color: '#FFFFFF',
  },

  // Missing category notice
  notice: {
    position: 'relative',
    margin: 12,
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#FDF8EA',
    borderWidth: 1,
    borderColor: '#F5E4B1',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  missRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  missPill: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#F7EED7',
  },
  missPillTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C6B2C',
  },

  allSet: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8C6B2C',
  },

  // Category Groups


  groupHdr: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  groupTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },

  // groupUnderline: {
  //   marginTop: 6,
  //   width: 36,
  //   // height: 2,
  //   borderRadius: 1,
  //   backgroundColor: '#D5D5D5',
  // },

  // Item Card
  cardSm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    ...SHADOW
  },

  imgWrap: {
    position: 'relative',
  },

  imgSm: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },

  priceBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: '#1E874B',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },

  priceText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },

  itemTitle: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },

  // Add button
  addBtnSm: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#1E874B',

  },

  addTxt: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Empty Box
  empty: {
    marginTop: 14,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#FDF8EA',
    borderWidth: 1,
    borderColor: '#F5E4B1',
    alignItems: 'center',
    gap: 6,
  },

  emptyTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8C6B2C',
  },
});

