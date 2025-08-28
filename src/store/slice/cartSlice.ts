import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

type AddPayload = {
  id: string;
  name?: string;
  price: number; // single-unit price
  qty?: number; // default 1
  image?: string;
  variant?: string; // e.g., size/color
};
type SetQtyPayload = { id: string; variant?: string; qty: number };
type RemovePayload = { id: string; variant?: string };

const keyOf = (id: string, variant?: string) => `${id}::${variant ?? ''}`;

export type CartLine = {
  key: string;
  id: string;
  name?: string;
  price: number;
  qty: number;
  image?: string;
  variant?: string;
};

type CartState = { lines: Record<string, CartLine> };
const initialState: CartState = { lines: {} };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (s, a: PayloadAction<AddPayload>) => {
      const { id, variant } = a.payload;
      const key = keyOf(id, variant);
      const qty = a.payload.qty ?? 1;
      const existing = s.lines[key];
      if (existing) {
        existing.qty += qty;
      } else {
        s.lines[key] = { key, qty, ...a.payload };
      }
    },
    decreaseItem: (s, a: PayloadAction<RemovePayload>) => {
      const key = keyOf(a.payload.id, a.payload.variant);
      const line = s.lines[key];
      if (!line) return;
      line.qty -= 1;
      if (line.qty <= 0) delete s.lines[key];
    },
    setQty: (s, a: PayloadAction<SetQtyPayload>) => {
      const { id, variant, qty } = a.payload;
      const key = keyOf(id, variant);
      if (qty <= 0) {
        delete s.lines[key];
        return;
      }
      const line = s.lines[key];
      if (line) line.qty = qty;
    },
    removeItem: (s, a: PayloadAction<RemovePayload>) => {
      const key = keyOf(a.payload.id, a.payload.variant);
      delete s.lines[key];
    },
    clearCart: s => {
      s.lines = {};
    },
  },
});

export const { addItem, decreaseItem, setQty, removeItem, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectLinesObj = (s: { cart: CartState }) => s.cart.lines;
export const selectLines = createSelector(selectLinesObj, o =>
  Object.values(o),
);
export const selectCount = createSelector(selectLines, arr =>
  arr.reduce((n, l) => n + l.qty, 0),
);
export const selectSubtotal = createSelector(selectLines, arr =>
  arr.reduce((n, l) => n + l.qty * l.price, 0),
);
