// src/store/slice/dayCatalogSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/* types */
export type DayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type CatalogKV = {
  key: 'probiotics' | 'protein' | 'sides' | 'veggies';
  value: Array<{
    id: string;
    variantId: string;
    title: string;
    description: string;
    tags: string[];
    image: string | null;
    price: string;
  }>;
};

type State = {
  currentDay: DayName | null;
  byDay: Partial<Record<DayName, CatalogKV[]>>; // store many days
};

const initialState: State = {
  currentDay: null,
  byDay: {},
};

const dayCatalogSlice = createSlice({
  name: 'dayCatalog',
  initialState,
  reducers: {
    // Set which day user is viewing (does not touch data)
    setCurrentDay: (state, action: PayloadAction<DayName>) => {
      state.currentDay = action.payload;
    },

    // Upsert a single day. If same day comes again, REPLACE only that day's data.
    upsertDay: (
      state,
      action: PayloadAction<{ day: DayName; catalog: CatalogKV[] }>,
    ) => {
      const { day, catalog } = action.payload;
      state.byDay[day] = catalog; // overwrite this day only
    },

    // Optional: upsert many days at once
    upsertMany: (
      state,
      action: PayloadAction<Array<{ day: DayName; catalog: CatalogKV[] }>>,
    ) => {
      for (const { day, catalog } of action.payload) state.byDay[day] = catalog;
    },

    // Remove one day, keep others
    clearDay: (state, action: PayloadAction<DayName>) => {
      delete state.byDay[action.payload];
      if (state.currentDay === action.payload) state.currentDay = null;
    },

    // Wipe all
    clearAll: state => {
      state.byDay = {};
      state.currentDay = null;
    },
  },
});

export const { setCurrentDay, upsertDay, upsertMany, clearDay, clearAll } =
  dayCatalogSlice.actions;

export default dayCatalogSlice.reducer;

/* selectors */
export const selectCurrentDay = (s: { dayCatalog: State }) =>
  s.dayCatalog.currentDay;
export const selectCatalogFor = (s: { dayCatalog: State }, day: DayName) =>
  s.dayCatalog.byDay[day] ?? [];
export const selectCurrentDayCatalog = (s: { dayCatalog: State }) => {
  const d = s.dayCatalog.currentDay;
  return d ? s.dayCatalog.byDay[d] ?? [] : [];
};

/* usage:
dispatch(upsertDay({ day: 'Wednesday', catalog: WED_RAW })); // adds or replaces Wednesday only
dispatch(upsertDay({ day: 'Thursday',  catalog: THU_RAW })); // adds or replaces Thursday only
dispatch(setCurrentDay('Wednesday')); // switch view
// If Wednesday comes again, calling upsertDay with Wednesday overwrites ONLY Wednesday. Others (e.g., Thursday) stay intact.
*/
