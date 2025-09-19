import React from 'react';
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

type CatalogItem = {
  id: string;
  variantId: string;
  title: string;
  description?: string;
  tags?: string[];
  image: string | null;
  price: string | number;
};
type CatalogGroup = { key: string; value: CatalogItem[] };

export default function MissingCategoryModal({
  visible,
  onClose,
  day,
  missingCats, // e.g. ['PROTEIN','VEGGIES']
  catalog, // CatalogGroup[]
  onAdd, // (payload) => void
}: {
  visible: boolean;
  onClose: () => void;
  day: string;
  missingCats: string[];
  catalog: CatalogGroup[];
  onAdd: (payload: {
    id: string;
    variantId: string;
    title: string;
    description?: string;
    tags?: string[];
    image: string | null;
    price: string | number;
    type: 'main';
    category: string; // UPPER
    qty: number;
    day: string;
    date: string;
  }) => void;
}) {
  const setUpper = (s: string) => String(s || '').toUpperCase();

  const groups = catalog.filter(g =>
    missingCats.map(setUpper).includes(setUpper(g.key)),
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
          <View style={s.header}>
            <Text style={s.title}>Complete your {day}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={s.close}
              hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
            >
              <FontAwesome5
                iconStyle="solid"
                name="times"
                size={18}
                color="#FFF"
              />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 12 }}>
            {groups.map(g => (
              <View key={g.key} style={s.group}>
                <Text style={s.groupTitle}>{setUpper(g.key)}</Text>

                {g.value.map(it => (
                  <View key={`${it.id}-${it.variantId}`} style={s.card}>
                    <Image
                      source={
                        it.image
                          ? { uri: it.image }
                          : require('../assets/LOGO.png')
                      }
                      style={s.img}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemTitle} numberOfLines={2}>
                        {it.title}
                      </Text>
                      <Text style={s.price}>${it.price}</Text>
                    </View>

                    <TouchableOpacity
                      style={s.addBtn}
                      activeOpacity={0.85}
                      onPress={() => {
                        const date = new Intl.DateTimeFormat('en-US').format(
                          new Date(),
                        );
                        onAdd({
                          id: it.id,
                          variantId: it.variantId,
                          title: it.title,
                          description: it.description,
                          tags: it.tags,
                          image: it.image,
                          price: it.price,
                          type: 'main', // fulfill required main cat
                          category: setUpper(g.key), // map group key
                          qty: 1,
                          day,
                          date,
                        });
                      }}
                    >
                      <Text style={s.addTxt}>Add</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}

            {!groups.length && (
              <View style={s.empty}>
                <Text style={s.emptyTxt}>No suggestions available.</Text>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '85%',
    ...SHADOW,
  },
  header: {
    padding: 14,
    backgroundColor: '#0B5733',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  title: { color: '#FFF', fontWeight: '800', fontSize: 18 },
  close: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: { marginBottom: 14 },
  groupTitle: {
    fontWeight: '800',
    color: C.black,
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E6EAE7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#FBFBFB',
  },
  img: {
    width: 60,
    height: 52,
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: '#EEE',
  },
  itemTitle: { color: C.black, fontWeight: '700', fontSize: 13 },
  price: { color: C.green, fontWeight: '800', marginTop: 4 },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0B5733',
    marginLeft: 8,
  },
  addTxt: { color: '#FFF', fontWeight: '800' },
  empty: { padding: 16, alignItems: 'center' },
  emptyTxt: { color: C.sub },
});
