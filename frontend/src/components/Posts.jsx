import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Post from "./Post";
import { fetchPosts } from "../redux/postSlice";
import { toast } from "sonner";

const Posts = () => {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((store) => store.post);

  // Fetch all posts on mount
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  // Show error toast if any
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return <p className="text-center mt-10">Loading posts...</p>;
  }

  if (!posts || posts.length === 0) {
    return <p className="text-center mt-10">No posts available</p>;
  }

  return (
    <div className="flex flex-col items-center">
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
