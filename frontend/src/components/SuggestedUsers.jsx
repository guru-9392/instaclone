import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import axios from "axios";
import { toast } from "sonner";
import { updateFollowStatus } from "../redux/authSlice";

const SuggestedUsers = () => {
  const dispatch = useDispatch();
  const { suggestedUsers, user: currentUser } = useSelector((store) => store.auth);

  const followHandler = async (user) => {
    if (!user?._id || !currentUser?._id) return;

    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/user/followorunfollow/${user._id}`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        // Determine new state after follow/unfollow
        const isFollowing = user.followers?.includes(currentUser._id);
        dispatch(updateFollowStatus({ userId: user._id, followed: !isFollowing }));

        // Show correct message based on new state
        toast.success(!isFollowing ? "Followed successfully" : "Unfollowed successfully");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to follow/unfollow");
    }
  };

  return (
    <div className="my-10">
      <h1 className="font-semibold text-gray-600 mb-2">Suggested for you</h1>
      {suggestedUsers.map((user) => {
        const isFollowing = user.followers?.includes(currentUser?._id);
        return (
          <div key={user._id} className="flex items-center justify-between my-3">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${user._id}`}>
                <Avatar>
                  <AvatarImage src={user.profilePicture} alt="user" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${user._id}`}>{user.username}</Link>
                </h1>
              </div>
            </div>
            <button
              onClick={() => followHandler(user)}
              className={`text-xs font-bold px-3 py-1 rounded ${
                isFollowing ? "text-gray-500 border border-gray-300" : "text-[#3BADF8]"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedUsers;
