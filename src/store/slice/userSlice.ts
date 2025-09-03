import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UserState = {
  id: string | null;
  name: string | null;
  email: string | null;
  customerToken: string | null;
  tokenExpire: string | null;
  phone: string | null;
  avatar: string | null;
};

const initialState: UserState = {
  id: null,
  name: null,
  email: null,
  customerToken: null,
  tokenExpire: null,
  phone: null,
  avatar: null,
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
      state.phone = action.payload.phone;
      state.avatar = action.payload.avatar;
    },
    clearUser: state => {
      state.id = null;
      state.name = null;
      state.email = null;
      state.customerToken = null;
      state.tokenExpire = null;
      state.phone = null;
      state.avatar = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
