import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  maintenanceMode: null,
  maintenanceTitle: "",
  maintenanceMessage: "",
  maintenanceImage: "",
  maintenanceAllowAdminAccess: true,
};

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    setMaintenanceState(state, action) {
      const {
        maintenanceMode,
        maintenanceTitle,
        maintenanceMessage,
        maintenanceImage,
        maintenanceAllowAdminAccess,
      } = action.payload;

      if (maintenanceMode !== undefined) state.maintenanceMode = maintenanceMode;
      if (maintenanceTitle !== undefined) state.maintenanceTitle = maintenanceTitle;
      if (maintenanceMessage !== undefined) state.maintenanceMessage = maintenanceMessage;
      if (maintenanceImage !== undefined) state.maintenanceImage = maintenanceImage;
      if (maintenanceAllowAdminAccess !== undefined)
        state.maintenanceAllowAdminAccess = maintenanceAllowAdminAccess;
    },
    resetMaintenanceState() {
      return initialState;
    },
  },
});

export const { setMaintenanceState, resetMaintenanceState } = maintenanceSlice.actions;

export default maintenanceSlice.reducer;
