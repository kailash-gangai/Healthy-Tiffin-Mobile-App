import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Button,
} from 'react-native';
import HeaderGreeting from '../../components/HeaderGreeting';
import FavoriteCard from '../../components/FavoriteCard';
import { CARTWRAP, COLORS } from '../../ui/theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { EMPTY_STATE_URL } from '../../constants';
import CTAButton from '../../components/CTAButton';
import { addItems } from '../../store/slice/cartSlice';
import { clearWishlist } from '../../store/slice/favoriteSlice';

export default function FavoritesScreen({ navigation }: { navigation?: any }) {
  const items = useAppSelector(s => s.favorite.items);
  const dispatch = useAppDispatch();
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <ScrollView>
        <HeaderGreeting name="Sam" />
        <View style={[CARTWRAP]}>
          {!items || items.length === 0 ? (
            <View style={styles.empty}>
              <Image
                source={{ uri: EMPTY_STATE_URL }}
                style={styles.emptyImg}
              />
              <Text style={styles.emptyTitle}>No favorites yet</Text>
              <Text style={styles.emptySub}>
                Tap the heart on any dish to save it here.
              </Text>
              {navigation ? (
                <TouchableOpacity
                  style={styles.cta}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.ctaTxt}>Browse dishes</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.list}>
              {items.map(it => (
                <View
                  key={`${it.id}-${it.variantId}-${it.category}-${it.day ?? ''
                    }`}
                  style={{ marginBottom: 12 }}
                >
                  <FavoriteCard item={it as any} />
                </View>
              ))}

              <TouchableOpacity
                onPress={() => dispatch(clearWishlist())}
                activeOpacity={0.8}
                style={[
                  styles.buttonBase,
                  styles.addNewTiffin,
                  styles.halfButton,
                ]}
              >

                <Text style={styles.newTiffinText}>Clear Favorites</Text>
              </TouchableOpacity>
              <View style={{ height: 16 }} />
              <View
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                {/* <CTAButton
                  label="Add to cart"
                  disabled={!items.length}
                  onPress={() => dispatch(addItems(items as any))}
                  toast={{
                    type: 'success',
                    title: 'Added',
                    message: 'Items added to cart',
                    position: 'bottom',
                  }}
                /> */}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 14 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyImg: {
    width: 160,
    height: 160,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1E1E1E' },
  emptySub: { marginTop: 6, color: '#777', textAlign: 'center' },
  cta: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0B5733',
  },
  ctaTxt: { color: '#FFF', fontWeight: '700' },

  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  halfButton: {
    flex: 1,
  },
  fullButton: {
    flex: 1,
    width: '100%',
  },
  addNewTiffin: {
    borderColor: '#0B5733',
    backgroundColor: '#d0ece2',
  },
  newTiffinText: {
    color: '#22774fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
