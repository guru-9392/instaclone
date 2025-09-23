import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { useDispatch, useSelector } from 'react-redux';
import Comment from './Comment';
import axios from 'axios';
import { toast } from 'sonner';
import { setPosts, setSelectedPost } from '@/redux/postSlice';

const CommentDialog = ({ open, setOpen }) => {
  const { selectedPost, posts } = useSelector(store => store.post);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const dispatch = useDispatch();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (selectedPost) {
      setComments(selectedPost.comments || []);
    }
  }, [selectedPost]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const changeEventHandler = (e) => {
    setCommentText(e.target.value);
  };

  const addCommentHandler = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(
        `https://instagramclone-ee2r.onrender.com/api/v1/post/${selectedPost._id}/comment`,
        { text: commentText.trim() },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );

      if (res.data.success) {
        const updatedComments = [...comments, res.data.comment];
        setComments(updatedComments);

        // Update Redux posts and selectedPost
        const updatedPosts = posts.map(p =>
          p._id === selectedPost._id ? { ...p, comments: updatedComments } : p
        );
        dispatch(setPosts(updatedPosts));
        dispatch(setSelectedPost({ ...selectedPost, comments: updatedComments }));

        setCommentText("");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add comment");
    }
  };

  if (!selectedPost) return null;

  const author = selectedPost.author || {};

  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-5xl p-0 flex flex-col md:flex-row">
        {/* Post Image */}
        <div className='w-full md:w-1/2 h-96 md:h-auto'>
          <img
            src={selectedPost.image}
            alt="post_img"
            className='w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none'
          />
        </div>

        {/* Comments Section */}
        <div className='w-full md:w-1/2 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-200'>
            <div className='flex gap-3 items-center'>
              <Link to={`/profile/${author._id}`}>
                <Avatar>
                  <AvatarImage src={author.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <Link to={`/profile/${author._id}`} className='font-semibold text-sm'>
                {author.username || "Unknown"}
              </Link>
            </div>

            <MoreHorizontal className='cursor-pointer' />
          </div>

          {/* Comments List */}
          <div
            ref={scrollRef}
            className='flex-1 overflow-y-auto max-h-96 p-4 space-y-2'
          >
            {comments.map(c => (
              <Comment key={c._id} comment={c} />
            ))}
          </div>

          {/* Add Comment */}
          <div className='p-4 border-t border-gray-200 flex items-center gap-2'>
            <input
              type="text"
              value={commentText}
              onChange={changeEventHandler}
              placeholder='Add a comment...'
              className='w-full outline-none border p-2 text-sm rounded'
            />
            <Button
              disabled={!commentText.trim()}
              onClick={addCommentHandler}
              variant="outline"
            >
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
