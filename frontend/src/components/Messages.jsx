import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Messages = ({ selectedUser }) => {
  const { messages } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);
  const chatRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  if (!messages || !Array.isArray(messages)) return null;

  return (
    <div ref={chatRef} className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
      {messages.map((msg) => {
        if (!msg) return null;

        // Use backend fields correctly
        const senderId = msg.sender?._id || msg.sender;
        const text = msg.text || "";

        const isSender = senderId === user?._id;

        return (
          <div
            key={msg._id}
            className={`flex items-end ${isSender ? "justify-end" : "justify-start"}`}
          >
            {/* Receiver avatar */}
            {!isSender && (
              <Avatar className="w-10 h-10 mr-2">
                <AvatarImage src={selectedUser?.profilePicture} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}

            {/* Message bubble */}
            <div
              className={`p-2 rounded-lg max-w-xs break-words ${
                isSender ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
              }`}
            >
              {text}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
