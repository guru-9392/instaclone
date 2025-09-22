import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Comment = ({ comment }) => {
    if (!comment) return null; // Safeguard if comment is null

    return (
        <div className='my-2'>
            <div className='flex gap-3 items-center'>
                <Avatar>
                    <AvatarImage src={comment?.author?.profilePicture || "/default-avatar.png"} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <h1 className='font-bold text-sm'>
                    {comment?.author?.username || "Unknown"}{' '}
                    <span className='font-normal pl-1'>{comment?.text}</span>
                </h1>
            </div>
        </div>
    );
};

export default Comment;
