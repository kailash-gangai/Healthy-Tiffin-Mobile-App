import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'fitbit.connected';

export type ConnectionState = {
  connected: boolean | null; // null until loaded
  loading: boolean;
  error: string | null;
};

const initialState: ConnectionState = {
  connected: null,
  loading: false,
  error: null,
};

export const loadFitbitConnection = createAsyncThunk<boolean>(
  'fitbitConnection/load',
  async () => {
    const v = await AsyncStorage.getItem(KEY);
    return v === '1';
  },
);

export const saveFitbitConnection = createAsyncThunk<boolean, boolean>(
  'fitbitConnection/save',
  async val => {
    await AsyncStorage.setItem(KEY, val ? '1' : '0');
    return val;
  },
);

const slice = createSlice({
  name: 'fitbitConnection',
  initialState,
  reducers: {
    // optional direct setter (without persistence)
    setConnected(state, a: PayloadAction<boolean>) {
      state.connected = a.payload;
    },
    clearConnection(state) {
      state.connected = false;
    },
  },
  extraReducers: b => {
    b.addCase(loadFitbitConnection.pending, s => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(loadFitbitConnection.fulfilled, (s, a) => {
      s.loading = false;
      s.connected = a.payload;
    });
    b.addCase(loadFitbitConnection.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message ?? 'load failed';
      s.connected = false;
    });

    b.addCase(saveFitbitConnection.pending, s => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(saveFitbitConnection.fulfilled, (s, a) => {
      s.loading = false;
      s.connected = a.payload;
    });
    b.addCase(saveFitbitConnection.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message ?? 'save failed';
    });
  },
});

export const { setConnected, clearConnection } = slice.actions;
export default slice.reducer;

// selectors
export const selectFitbitConnected = (s: any) =>
  s.fitbitConnection.connected as boolean | null;
export const selectFitbitConnLoading = (s: any) =>
  s.fitbitConnection.loading as boolean;
