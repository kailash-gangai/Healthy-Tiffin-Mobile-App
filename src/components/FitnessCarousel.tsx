import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SHADOW } from '../ui/theme';

type Item = { id: string; title: string; image: any };

export default function FitnessCarousel({ items }: { items: Item[] }) {
      return (
            <View>
                  <View style={s.head}>
                        <Text style={s.title}>Free Fitness Sessions</Text>
                        <TouchableOpacity activeOpacity={0.7}>
                              <Text style={s.link}>View All</Text>
                        </TouchableOpacity>
                  </View>

                  <FlatList
                        horizontal
                        data={items}
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(i) => i.id}
                        ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
                        contentContainerStyle={{ paddingRight: 6 }}
                        renderItem={({ item }) => (
                              <View style={s.card}>
                                    <Image source={item.image} style={s.img} />
                                    <Text style={s.caption} numberOfLines={2}>
                                          {item.title}
                                    </Text>
                              </View>
                        )}
                  />
            </View>
      );
}

const s = StyleSheet.create({
      head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 16 },
      title: { color: COLORS.black, fontSize: 20, fontWeight: '800' },
      link: { color: COLORS.green, textDecorationLine: 'underline', fontWeight: '700' },

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
