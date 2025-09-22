import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from "socket.io-client";
import { setOnlineUsers } from './redux/chatSlice';
import { setLikeNotification } from './redux/rtnSlice';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProtectedRoutes from './components/ProtectedRoutes';
import MainLayout from './components/MainLayout';
import Home from './components/Home';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import ChatPage from './components/ChatPage';
import Login from './components/Login';
import Signup from './components/Signup';

// socketRef outside component
export const socketRef = { current: null };

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children: [
      { path: '/', element: <ProtectedRoutes><Home /></ProtectedRoutes> },
      { path: '/profile/:id', element: <ProtectedRoutes><Profile /></ProtectedRoutes> },
      { path: '/account/edit', element: <ProtectedRoutes><EditProfile /></ProtectedRoutes> },
      { path: '/chat', element: <ProtectedRoutes><ChatPage /></ProtectedRoutes> },
    ]
  },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
]);

function App() {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;

    socketRef.current = io('http://localhost:8000', {
      query: { userId: user._id },
      transports: ['websocket'],
    });

    socketRef.current.on('getOnlineUsers', onlineUsers => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    socketRef.current.on('notification', notification => {
      dispatch(setLikeNotification(notification));
    });

    return () => {
      // ✅ Only disconnect if socket exists
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, dispatch]);

  return <RouterProvider router={browserRouter} />;
}

export default App;
