import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    likeNotification: [],
    messageNotification: [],
  },
  reducers: {
    setLikeNotification: (state, action) => {
      state.likeNotification.unshift(action.payload);
    },
    setMessageNotification: (state, action) => {
      state.messageNotification.unshift(action.payload);
    },
    clearNotifications: (state) => {
      state.likeNotification = [];
      state.messageNotification = [];
    },
  },
});

export const {
  setLikeNotification,
  setMessageNotification,
  clearNotifications,
} = rtnSlice.actions;

export default rtnSlice.reducer;
