import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SHADOW } from '../ui/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../screens/navigation/types';
import HealthFeedModal from './HealthFeedModal';

type Item = { id: string; title: string; image: any };

export default function FitnessCarousel({ items }: { items: any[] }) {
  const [open, setOpen] = useState<any>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View>
      <View style={s.head}>
        <Text style={s.title}>Free Fitness Sessions</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('HealthFeed', { items })}
        >
          <Text style={s.link}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={items}
        showsHorizontalScrollIndicator={false}
        keyExtractor={i => i.id}
        ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
        contentContainerStyle={{ paddingRight: 6 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={s.card}
            onPress={() => setOpen(item)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.title}`}
          >
            <Image source={{ uri: item.image }} style={s.img} />
            <Text
              style={s.caption}
              numberOfLines={2}
              onPress={() => setOpen(item)}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
      <HealthFeedModal open={open} onClose={() => setOpen(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  title: { color: COLORS.black, fontSize: 20, fontWeight: '800' },
  link: {
    color: COLORS.green,
    textDecorationLine: 'underline',
    fontWeight: '700',
  },

  card: {
    width: 250,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 10,
    ...SHADOW,
    marginBottom: 20,
  },
  img: {
    width: '100%',
    height: 140,
    borderRadius: 12,
  },
  caption: {
    marginTop: 10,
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '700',
  },
});
