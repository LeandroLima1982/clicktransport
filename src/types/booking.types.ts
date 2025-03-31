
export type PassengerInfo = {
  name: string;
  phone: string;
  email?: string;
};

export type LocationSuggestion = {
  id: string;
  place_name: string;
  center?: [number, number];
};

export type BookingAddressState = {
  originValue: string;
  destinationValue: string;
  originNumber: string;
  destinationNumber: string;
  originSuggestions: LocationSuggestion[];
  destinationSuggestions: LocationSuggestion[];
  isLoadingSuggestions: boolean;
};

export type BookingFormData = {
  originValue: string;
  destinationValue: string;
  originNumber: string;
  destinationNumber: string;
  date: Date | undefined;
  time: string;
  returnDate?: Date;
  returnTime?: string;
  tripType: 'oneway' | 'roundtrip';
  passengers: string;
  passengerData: PassengerInfo[];
};

// Import the main Booking type from booking.ts to maintain consistency
export { Booking } from './booking';
