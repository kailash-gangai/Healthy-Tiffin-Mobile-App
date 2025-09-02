import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the type for the state
interface DayState {
  selectedDayIndex: number;
}

const initialState: DayState = {
  selectedDayIndex: 0,
};

// Create the slice
const daySlice = createSlice({
  name: 'day', // Slice name
  initialState, // Initial state
  reducers: {
    setSelectedDay: (state, action: PayloadAction<number>) => {
      state.selectedDayIndex = action.payload;
    },
  },
});

export const { setSelectedDay } = daySlice.actions;

export default daySlice.reducer;
