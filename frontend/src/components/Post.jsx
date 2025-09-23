import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { Button } from './ui/button';
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { setPosts, setSelectedPost } from '@/redux/postSlice';
import { updateFollowStatus } from '@/redux/authSlice';
import { Badge } from './ui/badge';

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);

    const { user: currentUser } = useSelector(store => store.auth) || {};
    const { posts } = useSelector(store => store.post) || { posts: [] };
    const dispatch = useDispatch();

    if (!post || !post._id) return null;

    const author = post.author || {};
    const postFromStore = posts.find(p => p._id === post._id) || post;

    const liked = postFromStore?.likes?.includes(currentUser?._id) || false;
    const postLike = postFromStore?.likes?.length || 0;
    const bookmarked = postFromStore?.bookmarks?.includes(currentUser?._id) || false;

    const changeEventHandler = (e) => setText(e.target.value);

    // Like / Dislike
    const likeOrDislikeHandler = async () => {
        if (!post._id) return;
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(
                `https://instagramclone-ee2r.onrender.com/api/v1/post/${post._id}/${action}`,
                { withCredentials: true }
            );
            if (res.data.success) {
                const updatedPostData = posts.map(p =>
                    p._id === post._id
                        ? {
                              ...p,
                              likes: liked
                                  ? p.likes.filter(id => id !== currentUser._id)
                                  : [...p.likes, currentUser._id],
                          }
                        : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to update like");
        }
    };

    // Add Comment
    const commentHandler = async () => {
        if (!post._id || !text.trim()) return;
        try {
            const res = await axios.post(
                `https://instagramclone-ee2r.onrender.com/api/v1/post/${post._id}/comment`,
                { text: text.trim() },
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );
            if (res.data.success) {
                const updatedComments = [...(postFromStore.comments || []), res.data.comment];
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedComments } : p
                );
                dispatch(setPosts(updatedPostData));
                dispatch(setSelectedPost({ ...postFromStore, comments: updatedComments }));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to add comment");
        }
    };

    // Bookmark
    const bookmarkHandler = async () => {
        if (!post._id) return;
        try {
            const res = await axios.get(
                `https://instagramclone-ee2r.onrender.com/api/v1/post/${post._id}/bookmark`,
                { withCredentials: true }
            );
            if (res.data.success) {
                const updatedPostData = posts.map(p =>
                    p._id === post._id
                        ? {
                              ...p,
                              bookmarks: bookmarked
                                  ? p.bookmarks.filter(id => id !== currentUser._id)
                                  : [...(p.bookmarks || []), currentUser._id],
                          }
                        : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to bookmark");
        }
    };

    // Follow / Unfollow
    const followHandler = async () => {
        if (!author._id || !currentUser?._id) return;
        try {
            const res = await axios.post(
                `https://instagramclone-ee2r.onrender.com/api/v1/user/followorunfollow/${author._id}`,
                {},
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                const isFollowing = author.followers?.includes(currentUser._id);
                dispatch(updateFollowStatus({ userId: author._id, followed: !isFollowing }));

                const updatedPostData = posts.map(p =>
                    p._id === post._id
                        ? {
                              ...p,
                              author: {
                                  ...author,
                                  followers: !isFollowing
                                      ? [...(author.followers || []), currentUser._id]
                                      : (author.followers || []).filter(id => id !== currentUser._id),
                              },
                          }
                        : p
                );
                dispatch(setPosts(updatedPostData));
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to follow/unfollow");
        }
    };

    // Delete post
    const deleteHandler = async () => {
        if (!post._id) return;
        try {
            const res = await axios.delete(
                `https://instagramclone-ee2r.onrender.com/api/v1/post/delete/${post._id}`,
                { withCredentials: true }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                const updatedPosts = posts.filter(p => p._id !== post._id);
                dispatch(setPosts(updatedPosts));
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to delete post");
        }
    };

    return (
        <div className='my-6 w-full max-w-2xl mx-auto border rounded-lg shadow-sm p-4'>
            {/* Header */}
            <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={author.profilePicture} alt="post_image" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-2'>
                        <h1 className='font-semibold'>{author.username || "Unknown"}</h1>
                        {currentUser?._id === author._id && <Badge variant="secondary">Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer' />
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center text-sm text-center">
                        {author._id !== currentUser?._id && (
                            <Button onClick={followHandler} variant='ghost' className="w-fit text-[#ED4956] font-bold">
                                {author.followers?.includes(currentUser._id) ? "Unfollow" : "Follow"}
                            </Button>
                        )}
                        <Button onClick={bookmarkHandler} variant='ghost' className="w-fit">
                            {bookmarked ? "Bookmarked" : "Add to favorites"}
                        </Button>
                        {currentUser?._id === author._id && (
                            <Button onClick={deleteHandler} variant='ghost' className="w-fit text-red-500">
                                Delete
                            </Button>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Post Image */}
            {post.image && <img src={post.image} alt="post_img" className='w-64 h-64 md:w-80 md:h-80 rounded-xl object-cover mx-auto' />}

            {/* Actions */}
            <div className='flex items-center justify-between my-2'>
                <div className='flex items-center gap-3'>
                    {liked
                        ? <FaHeart onClick={likeOrDislikeHandler} size={24} className='cursor-pointer text-red-600' />
                        : <FaRegHeart onClick={likeOrDislikeHandler} size={22} className='cursor-pointer hover:text-gray-600' />}
                    <MessageCircle onClick={() => { dispatch(setSelectedPost(postFromStore)); setOpen(true); }} className='cursor-pointer hover:text-gray-600' />
                    <Send className='cursor-pointer hover:text-gray-600' />
                </div>
                <Bookmark onClick={bookmarkHandler} className='cursor-pointer hover:text-gray-600' />
            </div>

            {/* Likes & caption */}
            <span className='font-medium block mb-2'>{postLike} likes</span>
            <p><span className='font-medium mr-2'>{author.username || "Unknown"}</span>{post.caption}</p>

            {/* Comments */}
            {postFromStore.comments?.length > 0 && (
                <span onClick={() => { dispatch(setSelectedPost(postFromStore)); setOpen(true); }} className='cursor-pointer text-sm text-gray-400'>
                    View all {postFromStore.comments.length} comments
                </span>
            )}

            <CommentDialog open={open} setOpen={setOpen} />

            {/* Add comment */}
            <div className='flex items-center justify-between mt-2'>
                <input type="text" placeholder='Add a comment...' value={text} onChange={changeEventHandler} className='outline-none text-sm w-full p-2 border rounded' />
                {text.trim() && <span onClick={commentHandler} className='text-[#3BADF8] cursor-pointer font-medium'>Post</span>}
            </div>
        </div>
    );
};

export default Post;
