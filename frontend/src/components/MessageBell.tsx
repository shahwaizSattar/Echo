import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMessageNotification } from '../context/MessageNotificationContext';

const MessageBell: React.FC = () => {
  const navigation = useNavigation();
  const { unreadCount } = useMessageNotification();

  const handlePress = () => {
    (navigation as any).navigate('Messages');
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>💬</Text>
        {unreadCount > 0 && (
          <View style={{ 
            position: 'absolute', 
            top: -4, 
            right: -6, 
            backgroundColor: '#FF3B30', 
            borderRadius: 10, 
            paddingHorizontal: 6, 
            minWidth: 18, 
            height: 18, 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MessageBell;
