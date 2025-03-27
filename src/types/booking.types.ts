
export interface PassengerInfo {
  name: string;
  phone: string;
}

export interface BookingFormData {
  originValue: string;
  destinationValue: string;
  originNumber?: string;
  destinationNumber?: string;
  date: Date | undefined;
  returnDate: Date | undefined;
  tripType: 'oneway' | 'roundtrip';
  passengers: string;
  time: string;
  returnTime: string;
  passengerData: PassengerInfo[];
  distance?: number;
}

export interface LocationSuggestion {
  id: string;
  place_name: string;
  [key: string]: any;
}

export interface BookingAddressState {
  originValue: string;
  destinationValue: string;
  originNumber: string;
  destinationNumber: string;
  originSuggestions: LocationSuggestion[];
  destinationSuggestions: LocationSuggestion[];
  isLoadingSuggestions: boolean;
}
