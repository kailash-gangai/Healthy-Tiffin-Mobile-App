import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Linking } from 'react-native';

export type AvailabilityState = {
  installed: boolean | null; // null until checked
  checking: boolean;
  error: string | null;
  lastChecked: number | null;
};

const initialState: AvailabilityState = {
  installed: null,
  checking: false,
  error: null,
  lastChecked: null,
};

export const checkFitbitInstalled = createAsyncThunk<boolean>(
  'fitbitAvailability/check',
  async () => {
    const can = await Linking.canOpenURL('fitbit://');
    return !!can;
  },
);

const slice = createSlice({
  name: 'fitbitAvailability',
  initialState,
  reducers: {},
  extraReducers: b => {
    b.addCase(checkFitbitInstalled.pending, s => {
      s.checking = true;
      s.error = null;
    });
    b.addCase(
      checkFitbitInstalled.fulfilled,
      (s, a: PayloadAction<boolean>) => {
        s.checking = false;
        s.installed = a.payload;
        s.lastChecked = Date.now();
      },
    );
    b.addCase(checkFitbitInstalled.rejected, (s, a) => {
      s.checking = false;
      s.error = a.error.message ?? 'check failed';
      s.installed = false;
    });
  },
});

export default slice.reducer;

// selectors
export const selectFitbitInstalled = (s: any) =>
  s.fitbitAvailability.installed as boolean | null;
export const selectFitbitChecking = (s: any) =>
  s.fitbitAvailability.checking as boolean;
