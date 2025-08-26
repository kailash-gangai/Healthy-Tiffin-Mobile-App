import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';

import { COLORS, SPACING } from '../../ui/theme';

export default function TermsOfServiceScreen({ navigation }: any) {
      return (
            <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
                  {/* Header */}
                  <AppHeader title="Terms of Use" onBack={() => navigation.goBack()} />

                  <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={s.wrap}
                        showsVerticalScrollIndicator={false}
                  >
                        {/* Illustration */}
                        {/* <Image
                              source={require('../../assets/icons/privacy.png')}
                              style={s.img}
                              resizeMode="contain"
                        /> */}

                        {/* Body text */}
                        <Text style={s.txt}>
                              Lorem ipsum dolor sit amet consectetur. Vel sed maecenas at natoque
                              facilisi in sagittis egestas luctus. Suscipit lacus porta vel laoreet
                              feugiat sed nibh commodo posuere. Arcu scelerisque odio proin porttitor.
                              Vel eu nibh eros pellentesque. Morbi quam pulvinar eget cursus
                              pellentesque ultrices amet tortor. Etiam in vestibulum quis tincidunt.
                              Nibh mauris dolor mattis in libero sed sit. Massa quisque bibendum
                              venenatis donec scelerisque metus posuere orci. At eget dapibus faucibus
                              aliquet. Suspendisse in euismod tortor nunc libero placerat. Porttitor
                              tristique et sem lobortis sed. Nibh neque sed molestie massa suspendisse.
                              {/* Repeat or replace with real policy text */}
                        </Text>
                  </ScrollView>
            </SafeAreaView>
      );
}

const s = StyleSheet.create({
      wrap: { padding: SPACING * 2, paddingBottom: 30 },
      img: { width: 80, height: 80, alignSelf: 'center', marginVertical: 20 },
      txt: { color: COLORS.black, fontSize: 18, lineHeight: 28 },
});
