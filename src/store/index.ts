import { configureStore, combineReducers } from '@reduxjs/toolkit';
import cart from './slice/cartSlice';
import user from './slice/userSlice';
import fitbitAvailability from './slice/fitbitAvailabilitySlice';
import fitbitConnection from './slice/fitbitConnectionSlice';
import days from './slice/daySlice';
import favorite from './slice/favoriteSlice';
import catalog from './slice/catalogSlice';
import price from './slice/priceSlice';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';

const rootReducer = combineReducers({
  price,
  cart,
  user,
  fitbitAvailability,
  fitbitConnection,
  days,
  favorite,
  catalog,
});

const persistConfig = {
  key: 'root', // optionally scope per user later
  storage: AsyncStorage,
  whitelist: ['favorite'], // only persist wishlist
};

const persisted = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persisted,
  middleware: g => g({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
