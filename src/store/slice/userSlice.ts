import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UserState = { id: string | null };
const initialState: UserState = { id: null };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserId: (s, a: PayloadAction<string>) => {
      s.id = a.payload;
    },
    clearUser: s => {
      s.id = null;
    },
  },
});

export const { setUserId, clearUser } = userSlice.actions;
export default userSlice.reducer;
