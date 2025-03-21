
/// <reference types="vite/client" />
/// <reference types="@types/google.maps" />

// Declare global google namespace to make TypeScript happy
declare namespace google {
  namespace maps {
    // We need to explicitly declare the Places namespace
    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: google.maps.places.AutocompletionRequest,
          callback: (
            predictions: google.maps.places.AutocompletePrediction[] | null,
            status: google.maps.places.PlacesServiceStatus
          ) => void
        ): void;
      }
      
      enum PlacesServiceStatus {
        OK = 'OK',
        ZERO_RESULTS = 'ZERO_RESULTS',
        OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
        REQUEST_DENIED = 'REQUEST_DENIED',
        INVALID_REQUEST = 'INVALID_REQUEST',
        UNKNOWN_ERROR = 'UNKNOWN_ERROR',
        NOT_FOUND = 'NOT_FOUND'
      }
    }
  }
}
