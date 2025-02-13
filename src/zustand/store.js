import { create } from "zustand";
import userSlice from './slices/user.slice.js';
import providerSlice from './slices/provider.slice.js';

// Combine all slices in the store:
const useStore = create((...args) => ({
  ...userSlice(...args),
  ...providerSlice(...args),
}));

export default useStore;
