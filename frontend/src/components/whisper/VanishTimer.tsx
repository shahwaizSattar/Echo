import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface VanishTimerProps {
  vanishAt: string | Date;
  textColor?: string;
  onExpire?: () => void;
}

const VanishTimer: React.FC<VanishTimerProps> = ({ vanishAt, textColor = '#FF6B6B', onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(vanishAt).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft('Expired');
        if (onExpire) {
          onExpire();
        }
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [vanishAt]);

  if (!timeLeft || timeLeft === 'Expired') {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.timerText, { color: textColor }]}>
        ⏱️ {timeLeft}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  timerText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default VanishTimer;
