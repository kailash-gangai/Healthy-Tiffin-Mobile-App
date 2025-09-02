import { configureStore, combineReducers } from '@reduxjs/toolkit';
import cart from './slice/cartSlice';
import user from './slice/userSlice'; // if you already have it
import fitbitAvailability from '../store/slice/fitbitAvailabilitySlice';
import fitbitConnection from '../store/slice/fitbitConnectionSlice';
import days from '../store/slice/daySlice';


const rootReducer = combineReducers({
  cart,
  user,
  fitbitAvailability,
  fitbitConnection,
  days
});   
export const store = configureStore({ reducer: rootReducer });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
