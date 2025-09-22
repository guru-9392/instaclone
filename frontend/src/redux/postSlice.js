import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch posts from backend
export const fetchPosts = createAsyncThunk(
  "post/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/post/all", { withCredentials: true });
      if (res.data.success) return res.data.posts;
      return rejectWithValue("Failed to fetch posts");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    selectedPost: null,
    loading: false,
    error: null,
  },
  reducers: {
    setPosts: (state, action) => { state.posts = action.payload; },
    setSelectedPost: (state, action) => { state.selectedPost = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setPosts, setSelectedPost } = postSlice.actions;
export default postSlice.reducer;
