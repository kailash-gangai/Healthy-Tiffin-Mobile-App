import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

type AddPayload = {
  id: string;
  title: string;
  price: number | string;
  category: string;
  day: string;
  date: string;
  type: 'main' | 'addon';
  qty: number;
  image?: string;
  tiffinPlan?: number;

  variantId: string; // e.g., size/color
};

type SetQtyPayload = { id: string; variantId?: string; qty: number };
type RemovePayload = { id: string; variantId?: string; tiffinPlan: number };

type RemoveByDayPayload = { day: string };

export type CartLine = {
  id: string;
  type: 'main' | 'addon';
  category: string;
  day: string;
  date: string;
  variantId: string;
  title: string;
  price: number | string;
  qty: number;
  image?: string;
  tiffinPlan?: number;
};

type CartState = { isCartCleared: boolean; lines: CartLine[] };

const initialState: CartState = { isCartCleared: false, lines: [] };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Add multiple items to the cart
    addItems: (s, a: PayloadAction<AddPayload[]>) => {
      s.isCartCleared = false;

      const keyOf = (x: {
        day: string;
        tiffinPlan?: number;
        id: string;
        variantId: string;
      }) => `${x.day}::${x.tiffinPlan ?? ''}::${x.id}::${x.variantId}`;

      // existing keys in cart
      const seen = new Set(s.lines.map(keyOf));

      // also prevent duplicates within the same incoming batch
      for (const p of a.payload) {
        const k = keyOf(p);
        if (seen.has(k)) continue; // already in cart -> ignore

        seen.add(k);
        s.lines.push({
          id: p.id,
          variantId: p.variantId,
          title: p.title,
          price: p.price,
          image: p.image,
          qty: p.qty ?? 1,
          type: p.type,
          category: p.category,
          date: p.date,
          day: p.day,
          tiffinPlan: p.tiffinPlan,
        });
      }
    },

    // Add a single item to the cart
    addItem: (s, a: PayloadAction<AddPayload>) => {
      const {
        id,
        variantId,
        title,
        price,
        image,
        type,
        qty = 1,
        category,
        date,
        day,
        tiffinPlan,
      } = a.payload;
      const existing = s.lines.find(
        line => line.id === id && line.variantId === variantId,
      );
      s.isCartCleared = false;
      if (existing) {
        existing.qty += qty;
      } else {
        s.lines.push({
          id,
          variantId,
          title,
          tiffinPlan,
          price,
          image,
          qty,
          type,
          category,
          date,
          day,
        });
      }
    },

    // Decrease the quantity of an item
    decreaseItem: (s, a: PayloadAction<RemovePayload>) => {
      const { id, variantId } = a.payload;
      console.log({ id, variantId });

      const existing = s.lines.find(
        line => line.id === id && line.variantId === variantId,
      );

      if (existing) {
        existing.qty -= 1;
        if (existing.qty <= 0) {
          s.lines = s.lines.filter(line => line !== existing); // Remove item from the array
        }
      }
    },

    // Increase the quantity of an item
    increaseItem: (s, a: PayloadAction<RemovePayload>) => {
      const { id, variantId, tiffinPlan } = a.payload;
      console.log({ id, variantId });

      const existing = s.lines.find(
        line =>
          line.id === id &&
          line.variantId === variantId &&
          line.tiffinPlan === tiffinPlan,
      );

      if (existing) {
        existing.qty += 1;
      }
    },

    // Set the quantity of an item
    setQty: (s, a: PayloadAction<SetQtyPayload>) => {
      const { id, variantId, qty } = a.payload;
      const existing = s.lines.find(
        line => line.id === id && line.variantId === variantId,
      );

      if (existing) {
        if (qty <= 0) {
          s.lines = s.lines.filter(line => line !== existing); // Remove item if qty <= 0
        } else {
          existing.qty = qty;
        }
      }
    },

    // Remove an item from the cart
    removeItem: (s, a: PayloadAction<RemovePayload>) => {
      const { id, variantId, tiffinPlan } = a.payload;

      s.lines = s.lines.filter(
        line =>
          line.id !== id ||
          line.variantId !== variantId ||
          line.tiffinPlan !== tiffinPlan,
      );
    },

    // Clear all items from the cart
    clearCart: s => {
      s.lines = [];
      s.isCartCleared = true;
    },

    cartFLag: s => {
      s.isCartCleared = false;
    },
    removeDayMains: (s, a: PayloadAction<RemoveByDayPayload>) => {
      const { day } = a.payload;
      s.lines = s.lines.filter(l => !(l.day === day && l.type === 'main'));
    },

    // NEW: remove all ADDON items for a day
    removeDayAddons: (s, a: PayloadAction<RemoveByDayPayload>) => {
      const { day } = a.payload;
      s.lines = s.lines.filter(l => !(l.day === day && l.type === 'addon'));
    },
  },
});

// Export the actions
export const {
  addItems,
  addItem,
  decreaseItem,
  increaseItem,
  setQty,
  removeItem,
  clearCart,
  removeDayMains,
  removeDayAddons,
  cartFLag,
} = cartSlice.actions;
export default cartSlice.reducer;

// Selectors to access the cart state
export const selectLinesArray = (s: { cart: CartState }) => s.cart.lines;
export const selectCount = createSelector(selectLinesArray, arr =>
  arr.reduce((n, l) => n + l.qty, 0),
);
export const selectSubtotal = createSelector(selectLinesArray, arr =>
  arr.reduce((n, l) => n + l.qty * +l.price, 0),
);
