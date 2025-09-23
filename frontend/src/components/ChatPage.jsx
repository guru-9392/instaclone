import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { setMessages, addMessage } from "@/redux/chatSlice";
import Messages from "./Messages";
import { io } from "socket.io-client";
import axios from "axios";

let socket;

const ChatPage = () => {
  const { user, suggestedUsers, selectedUser } = useSelector((store) => store.auth);
  const { messages, onlineUsers } = useSelector((store) => store.chat);
  const dispatch = useDispatch();
  const [textMessage, setTextMessage] = useState("");

  useEffect(() => {
    socket = io("http://localhost:8000", { query: { userId: user?._id } });

    socket.on("newMessage", (message) => {
      dispatch(addMessage(message));
    });

    return () => socket.disconnect();
  }, [user?._id]);

  const sendMessageHandler = async (receiverId) => {
    if (!textMessage.trim()) return;

    try {
      const res = await axios.post(
        `https://instagramclone-ee2r.onrender.com/api/v1/message/send/${receiverId}`,
        { textMessage },
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(addMessage(res.data.newMessage));
        socket.emit("sendMessage", res.data.newMessage);
        setTextMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex ml-[16%] h-screen">
      <section className="w-full md:w-1/4 my-8 overflow-y-auto">
        {suggestedUsers.map((sUser) => (
          <div
            key={sUser._id}
            onClick={() => dispatch({ type: "auth/setSelectedUser", payload: sUser })}
            className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
          >
            <img src={sUser.profilePicture} alt="" className="w-14 h-14 rounded-full" />
            <div>
              <span>{sUser.username}</span>
              <span>{onlineUsers.includes(sUser._id) ? "online" : "offline"}</span>
            </div>
          </div>
        ))}
      </section>

      {selectedUser && (
        <section className="flex-1 border-l border-l-gray-300 flex flex-col h-full">
          <div className="flex items-center p-3 border-b border-gray-300">
            <span>{selectedUser.username}</span>
          </div>

          <Messages selectedUser={selectedUser} />

          <div className="flex p-3 border-t border-t-gray-300">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessageHandler(selectedUser._id)}
              placeholder="Type a message..."
              className="flex-1 mr-2"
            />
            <Button onClick={() => sendMessageHandler(selectedUser._id)}>Send</Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default ChatPage;
