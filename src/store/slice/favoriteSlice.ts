import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

export type FavoriteDish = {
  id: string;
  variantId: string;
  category: string;
  day?: string;
  title?: string;
  description?: string;
  image?: string;
  price?: string;
  type?: string;
  date?: string;
  tags?: string[];
};

type State = { items: FavoriteDish[] };
const initialState: State = { items: [] };

const keyOf = (
  x: Pick<FavoriteDish, 'id' | 'variantId' | 'category' | 'day'>,
) => `${x.id}::${x.variantId}::${x.category}::${x.day ?? ''}`;

const wishlist = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist(state, { payload }: PayloadAction<FavoriteDish>) {
      const k = keyOf(payload);
      const i = state.items.findIndex(it => keyOf(it) === k);
      if (i !== -1) state.items.splice(i, 1); // remove on second tap
      else state.items.push(payload); // add on first tap
    },
    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlist.actions;
export default wishlist.reducer;

// selectors
export const selectWishlist = (s: any) =>
  (s.favorite?.items ?? []) as FavoriteDish[];

export const selectIsWishlisted =
  (id: string, variantId: string, category: string, day?: string) => (s: any) =>
    selectWishlist(s).some(
      it =>
        it.id === id &&
        it.variantId === variantId &&
        it.category === category &&
        (it.day ?? '') === (day ?? ''),
    );

export const makeSelectByDay = (day: string) =>
  createSelector(selectWishlist, items =>
    items.filter(i => (i.day ?? '') === day),
  );

export const makeSelectByCategory = (category: string) =>
  createSelector(selectWishlist, items =>
    items.filter(i => i.category === category),
  );
