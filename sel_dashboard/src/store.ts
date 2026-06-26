import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { Device } from "./types";

type SelectionState = {
  selectedDevice: Device | null;
};

const initialState: SelectionState = {
  selectedDevice: null,
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    setSelectedDevice(state, action: PayloadAction<Device | null>) {
      state.selectedDevice = action.payload;
    },
  },
});

export const { setSelectedDevice } = selectionSlice.actions;

export const store = configureStore({
  reducer: {
    selection: selectionSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
