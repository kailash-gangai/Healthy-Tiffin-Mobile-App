import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clear } from 'react-native/types_generated/Libraries/LogBox/Data/LogBoxData';

type UserState = {
  id: string | null;
  name: string | null;
  email: string | null;
  customerToken: string | null;
  tokenExpire: string | null;
};

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  customerToken: null,
  tokenExpire: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.customerToken = action.payload.customerToken;
      state.tokenExpire = action.payload.tokenExpire;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    clearUserId: (state, action: PayloadAction<string>) => {
      state.id = null;
    },

    clearUser: state => {
      state.id = null;
      state.name = null;
      state.email = null;
      state.customerToken = null;
      state.tokenExpire = null;
    },
  },
});

export const { setUser, clearUser, setUserId, clearUserId } = userSlice.actions;
export default userSlice.reducer;
