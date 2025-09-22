import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,              // logged-in user
    suggestedUsers: [],      // sidebar suggested users
    userProfile: null,       // profile page data
    selectedUser: null       // selected user for modal/detail
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
    },
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = action.payload;
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    // FOLLOW / UNFOLLOW action
    updateFollowStatus: (state, action) => {
      const { userId, followed } = action.payload;

      // Update suggestedUsers
      const index = state.suggestedUsers.findIndex(u => u._id === userId);
      if (index !== -1) {
        if (followed) {
          state.suggestedUsers[index].followers.push(state.user._id);
        } else {
          state.suggestedUsers[index].followers = state.suggestedUsers[index].followers.filter(
            id => id !== state.user._id
          );
        }
      }

      // Optionally update logged-in user's following list
      if (state.user) {
        if (followed) {
          state.user.following.push(userId);
        } else {
          state.user.following = state.user.following.filter(id => id !== userId);
        }
      }

      // Update selectedUser if it's the same
      if (state.selectedUser?._id === userId) {
        if (followed) {
          state.selectedUser.followers.push(state.user._id);
        } else {
          state.selectedUser.followers = state.selectedUser.followers.filter(
            id => id !== state.user._id
          );
        }
      }
    }
  }
});

export const {
  setAuthUser,
  setSuggestedUsers,
  setUserProfile,
  setSelectedUser,
  updateFollowStatus
} = authSlice.actions;

export default authSlice.reducer;
