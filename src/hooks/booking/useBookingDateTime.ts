
import { useState } from 'react';

export const useBookingDateTime = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>('');
  const [returnTime, setReturnTime] = useState<string>('');
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');

  return {
    date,
    returnDate,
    time,
    returnTime,
    tripType,
    setDate,
    setReturnDate,
    setTime,
    setReturnTime,
    setTripType
  };
};
