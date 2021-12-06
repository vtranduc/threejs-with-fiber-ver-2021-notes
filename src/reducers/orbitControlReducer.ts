import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SCENE_CONSTANTS } from "../constants";

export interface OrbitControlState {
  enabled: boolean;
}

const initialState: OrbitControlState = {
  enabled: SCENE_CONSTANTS.orbitControl,
};

const orbitControlSlice = createSlice({
  name: "orbitControl",
  initialState,
  reducers: {
    setOrbitControlEnabled(state, { payload }: PayloadAction<boolean>) {
      state.enabled = payload;
    },
  },
});

export const { setOrbitControlEnabled } = orbitControlSlice.actions;

export default orbitControlSlice.reducer;
