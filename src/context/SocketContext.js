import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      
      const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'https://campus-event-backend.onrender.com', {
        auth: {
          userId: user._id
        }
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setConnected(true);
        
        // Join user's personal room
        newSocket.emit('join', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    } else {
      
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [user, socket]);

  // Send notification
  const sendNotification = (data) => {
    if (socket && connected) {
      socket.emit('send_notification', data);
    }
  };

  // Send event update
  const sendEventUpdate = (data) => {
    if (socket && connected) {
      socket.emit('event_update', data);
    }
  };

  // Subscribe to notifications
  const onNotification = (callback) => {
    if (socket) {
      socket.on('notification', callback);
      
      // Return cleanup function
      return () => socket.off('notification', callback);
    }
  };

  // Subscribe to event updates
  const onEventUpdate = (callback) => {
    if (socket) {
      socket.on('event_updated', callback);
      
      // Return cleanup function
      return () => socket.off('event_updated', callback);
    }
  };

  // Subscribe to real-time registration updates
  const onRegistrationUpdate = (callback) => {
    if (socket) {
      socket.on('registration_update', callback);
      
      // Return cleanup function
      return () => socket.off('registration_update', callback);
    }
  };

  // Join event room (for real-time updates during events)
  const joinEventRoom = (eventId) => {
    if (socket && connected) {
      socket.emit('join_event', eventId);
    }
  };

  // Leave event room
  const leaveEventRoom = (eventId) => {
    if (socket && connected) {
      socket.emit('leave_event', eventId);
    }
  };

  // Send message to event room
  const sendEventMessage = (eventId, message) => {
    if (socket && connected) {
      socket.emit('event_message', { eventId, message });
    }
  };

  // Subscribe to event messages
  const onEventMessage = (callback) => {
    if (socket) {
      socket.on('event_message', callback);
      
      // Return cleanup function
      return () => socket.off('event_message', callback);
    }
  };

  const value = {
    socket,
    connected,
    sendNotification,
    sendEventUpdate,
    onNotification,
    onEventUpdate,
    onRegistrationUpdate,
    joinEventRoom,
    leaveEventRoom,
    sendEventMessage,
    onEventMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
