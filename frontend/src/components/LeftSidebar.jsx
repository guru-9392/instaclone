import React, { useEffect, useState } from "react";
import { Heart, MessageCircle, Home, PlusSquare, LogOut, Search, TrendingUp } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { setLikeNotification, setMessageNotification } from "../redux/rtnSlice";
import { io } from "socket.io-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import CreatePost from "./CreatePost";
import { useNavigate } from "react-router-dom";
import { setAuthUser } from "../redux/authSlice";
import { setPosts, setSelectedPost } from "../redux/postSlice";

let socket;

const LeftSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector((store) => store.realTimeNotification);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user?._id) return;

    if (!socket) {
      socket = io("http://localhost:8000", {
        query: { userId: user._id },
        reconnection: true,
      });
    }

    socket.off("notification");
    socket.on("notification", (data) => {
      socket.emit("notification:received", data.id || Date.now());
      if (data.type === "like" || data.type === "dislike") {
        dispatch(setLikeNotification(data));
      } else if (data.type === "message") {
        dispatch(setMessageNotification(data));
      }
    });

    return () => {
      socket.off("notification");
    };
  }, [user?._id, dispatch]);

  const sidebarHandler = (textType) => {
    switch (textType) {
      case "Logout":
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        break;
      case "Create":
        setOpen(true);
        break;
      case "Home":
        navigate("/");
        break;
      case "Messages":
        navigate("/chat");
        break;
      case "Profile":
        navigate(`/profile/${user?._id}`);
        break;
      default:
        break;
    }
  };

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt="Profile" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];

  return (
    <div className="fixed top-0 left-0 px-4 border-r border-gray-300 w-[16%] h-screen">
      <div className="flex flex-col">
        <h1 className="my-8 pl-3 font-bold text-xl">LOGO</h1>
        <div>
          {sidebarItems.map((item, index) => (
            <div
              onClick={() => sidebarHandler(item.text)}
              key={index}
              className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3"
            >
              {item.icon}
              <span>{item.text}</span>
              {item.text === "Notifications" && likeNotification.length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      className="rounded-full h-5 w-5 bg-red-600 absolute bottom-6 left-6"
                    >
                      {likeNotification.length}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div>
                      {likeNotification.map((n, idx) => (
                        <div key={idx} className="flex items-center gap-2 my-2">
                          <Avatar>
                            <AvatarImage src={n.userDetails?.profilePicture} />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <p className="text-sm">
                            <span className="font-bold">{n.userDetails?.username}</span>{" "}
                            {n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          ))}
        </div>
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;
