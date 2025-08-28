import { configureStore } from '@reduxjs/toolkit';
import cart from './slice/cartSlice';
import user from './slice/userSlice'; // if you already have it

export const store = configureStore({ reducer: { cart, user } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
