import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import MessageNotification from '../components/MessageNotification';
import { chatAPI } from '../services/api';

interface MessageNotificationData {
  senderName: string;
  senderAvatar?: string;
  text: string;
  senderId: string;
}

interface MessageNotificationContextType {
  showNotification: (message: MessageNotificationData) => void;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const MessageNotificationContext = createContext<MessageNotificationContextType | undefined>(undefined);

export const useMessageNotification = () => {
  const context = useContext(MessageNotificationContext);
  if (!context) {
    throw new Error('useMessageNotification must be used within MessageNotificationProvider');
  }
  return context;
};

export const MessageNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [notification, setNotification] = useState<MessageNotificationData | null>(null);
  const [visible, setVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load initial unread count
  const refreshUnreadCount = async () => {
    try {
      if (user) {
        const response = await chatAPI.getUnreadCount();
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (e) {
      console.error('Error loading unread count:', e);
    }
  };

  useEffect(() => {
    if (user) {
      refreshUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    const socket = getSocket();
    
    const handleNewMessage = (payload: any) => {
      try {
        const { sender, message, unreadCount: newUnreadCount } = payload || {};
        const senderId = String(sender?._id || sender);
        const myId = String(user?._id || '');
        
        // Update unread count
        if (typeof newUnreadCount === 'number') {
          setUnreadCount(newUnreadCount);
        }
        
        // Only show notification if message is from someone else
        if (senderId && senderId !== myId) {
          showNotification({
            senderName: sender?.username || 'Someone',
            senderAvatar: sender?.avatar,
            text: message?.text || 'Sent a message',
            senderId: senderId,
          });
        }
      } catch (e) {
        console.error('Error handling message notification:', e);
      }
    };

    const handleUnreadUpdate = (payload: any) => {
      try {
        if (typeof payload?.unreadCount === 'number') {
          setUnreadCount(payload.unreadCount);
        }
      } catch (e) {
        console.error('Error handling unread update:', e);
      }
    };

    socket.on('chat:new-message', handleNewMessage);
    socket.on('chat:unread-update', handleUnreadUpdate);

    return () => {
      socket.off('chat:new-message', handleNewMessage);
      socket.off('chat:unread-update', handleUnreadUpdate);
    };
  }, [user?._id]);

  const showNotification = (message: MessageNotificationData) => {
    setNotification(message);
    setVisible(true);
  };

  const handlePress = () => {
    if (notification) {
      setVisible(false);
      // Navigate to chat with the sender
      (navigation as any).navigate('Chat', {
        peerId: notification.senderId,
        username: notification.senderName,
        avatar: notification.senderAvatar,
      });
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => {
      setNotification(null);
    }, 300);
  };

  return (
    <MessageNotificationContext.Provider value={{ showNotification, unreadCount, refreshUnreadCount }}>
      {children}
      {notification && (
        <MessageNotification
          visible={visible}
          message={notification}
          onPress={handlePress}
          onDismiss={handleDismiss}
        />
      )}
    </MessageNotificationContext.Provider>
  );
};
