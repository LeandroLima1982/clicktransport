
import { useState } from 'react';
import { PassengerInfo } from '@/types/booking.types';

export const usePassengerData = () => {
  const [passengers, setPassengers] = useState('1');
  const [passengerData, setPassengerData] = useState<PassengerInfo[]>([{ name: '', phone: '' }]);

  return {
    passengers,
    passengerData,
    setPassengers,
    setPassengerData
  };
};
