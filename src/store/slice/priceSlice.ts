// src/store/slice/priceThresholdSlice.ts
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

export type PriceKV = { key: string; value: string }; // store EXACT server data

type Prefix = 'probiotics' | 'protein' | 'sides' | 'veggies';

type State = {
  raw: PriceKV[]; // exact data as received
  byPrefix: Partial<Record<Prefix, number>>; // parsed convenience map
};

const initialState: State = {
  raw: [],
  byPrefix: {},
};

function buildMap(raw: PriceKV[]): State['byPrefix'] {
  const out: State['byPrefix'] = {};
  for (const { key, value } of raw) {
    const prefix = key.split('_')[0]?.trim().toLowerCase() as Prefix;
    const num = parseFloat(value);
    if (prefix && Number.isFinite(num)) out[prefix] = num;
  }
  return out;
}

const slice = createSlice({
  name: 'priceThreshold',
  initialState,
  reducers: {
    // Replace all thresholds with fresh server payload (exact copy kept in state.raw)
    setAll(state, action: PayloadAction<PriceKV[]>) {
      state.raw = action.payload.slice(); // keep exact
      state.byPrefix = buildMap(state.raw);
    },
    // Upsert a single entry by key
    upsertOne(state, action: PayloadAction<PriceKV>) {
      const i = state.raw.findIndex(r => r.key === action.payload.key);
      if (i >= 0) state.raw[i] = action.payload;
      else state.raw.push(action.payload);
      state.byPrefix = buildMap(state.raw);
    },
    clear(state) {
      state.raw = [];
      state.byPrefix = {};
    },
  },
});

export const { setAll, upsertOne, clear } = slice.actions;
export default slice.reducer;

/* selectors */
export const selectPriceRaw = (s: { priceThreshold: State }) =>
  s.priceThreshold.raw;

export const selectPriceMap = (s: { priceThreshold: State }) =>
  s.priceThreshold.byPrefix;

export const selectThresholdFor =
  (prefix: Prefix) => (s: { priceThreshold: State }) =>
    s.priceThreshold.byPrefix[prefix] ?? 0;

// Example derived selector for applying thresholds to a catalog array
export const makeApplyThresholds = () =>
  createSelector(
    [
      (s: any, cats: Array<{ key: string; value: any[] }>) => cats,
      selectPriceMap,
    ],
    (cats, map: State['byPrefix']) =>
      cats.map(cat => {
        const pref = cat.key.toLowerCase() as Prefix;
        const thr = map[pref];
        if (!Number.isFinite(thr)) return cat;
        return {
          ...cat,
          value: cat.value.map((it: any) => {
            const priceNum = parseFloat(String(it.price));
            if (!Number.isFinite(priceNum)) return it;
            const decs = String(it.price).includes('.')
              ? String(it.price).split('.')[1].length
              : 0;
            const next = Math.max(priceNum - (thr as number), 0);
            return {
              ...it,
              price: decs ? Number(next.toFixed(decs)) : Math.trunc(next),
            };
          }),
        };
      }),
  );

/* usage:
dispatch(setAll([
  { key: 'probiotics_price_threshold', value: '4.5' },
  { key: 'protein_price_threshold',    value: '10.0' },
  { key: 'sides_price_threshold',      value: '4.5' },
  { key: 'veggies_price_threshold',    value: '10.0' },
]));
// exact payload is in state.priceThreshold.raw
// numeric map is in state.priceThreshold.byPrefix
*/
