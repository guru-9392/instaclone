import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "@/redux/chatSlice";

const useGetRTM = (socket, selectedUser) => {
  const dispatch = useDispatch();
  const { messages } = useSelector((store) => store.chat);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (
        selectedUser &&
        (newMessage.sender._id === selectedUser._id ||
          newMessage.receiver === selectedUser._id)
      ) {
        dispatch(setMessages((prev) => [...prev, newMessage]));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser, messages, dispatch]);
};

export default useGetRTM;
