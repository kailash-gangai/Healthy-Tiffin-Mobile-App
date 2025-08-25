import React from 'react';
import { View, Text, Image, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../ui/theme';

export default function FitnessCarousel({ items }: { items: { id: string; title: string; image: any }[] }) {
      return (
            <View>
                  <View style={s.head}>
                        <Text style={s.title}>Free Fitness Sessions</Text>
                        <TouchableOpacity><Text style={s.link}>View All</Text></TouchableOpacity>
                  </View>
                  <FlatList
                        horizontal
                        data={items}
                        keyExtractor={i => i.id}
                        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                              <View style={s.card}>
                                    <Image source={item.image} style={s.img} />
                                    <Text numberOfLines={2} style={s.txt}>{item.title}</Text>
                              </View>
                        )}
                  />
            </View>
      );
}

const s = StyleSheet.create({
      head: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
      title: { fontWeight: '800', color: COLORS.text },
      link: { color: COLORS.sub },
      card: { width: 220, backgroundColor: COLORS.white, borderRadius: 12, overflow: 'hidden' },
      img: { width: '100%', height: 110 },
      txt: { padding: 10, color: COLORS.text },
});
