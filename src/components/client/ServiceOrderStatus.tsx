
import React from 'react';
import { Check, Clock, Car, MapPin, AlertTriangle } from 'lucide-react';
import { Booking } from '@/types/booking';

interface ServiceOrderStatusProps {
  status?: string;
  booking?: Booking;
  className?: string;
}

const ServiceOrderStatus: React.FC<ServiceOrderStatusProps> = ({ 
  status: propStatus,
  booking,
  className = ""
}) => {
  // Use either the provided status directly or get it from the booking
  const status = propStatus || (booking ? booking.status : 'pending');

  // Define the steps in the service order flow
  const steps = [
    { id: 'pending', label: 'Pendente', icon: Clock },
    { id: 'assigned', label: 'Atribuído', icon: Check },
    { id: 'in_progress', label: 'Em andamento', icon: Car },
    { id: 'completed', label: 'Finalizado', icon: MapPin },
  ];

  // Map booking status to service order status if needed
  const getOrderStatus = (bookingStatus: string) => {
    switch (bookingStatus) {
      case 'pending': return 'pending';
      case 'confirmed': return 'assigned';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return bookingStatus;
    }
  };

  const orderStatus = getOrderStatus(status);
  
  // Find the current step index
  const getCurrentStepIndex = () => {
    if (orderStatus === 'cancelled') return -1;
    
    const index = steps.findIndex(step => step.id === orderStatus);
    return index >= 0 ? index : 0; // Default to first step if not found
  };

  const currentStepIndex = getCurrentStepIndex();

  if (orderStatus === 'cancelled') {
    return (
      <div className={`flex items-center justify-center p-4 bg-red-50 rounded-lg ${className}`}>
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
        <span className="text-red-500 font-medium">Reserva cancelada</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="text-sm font-medium mb-3">Status da sua viagem:</div>
      <div className="flex items-center justify-between w-full">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Connect with line except for first item */}
              {index > 0 && (
                <div 
                  className={`absolute top-5 right-1/2 w-full h-[2px] -translate-y-1/2 transform ${
                    index <= currentStepIndex ? 'bg-primary' : 'bg-gray-200'
                  }`} 
                  style={{ right: '50%', width: '100%' }}
                />
              )}
              
              <div 
                className={`relative z-10 w-10 h-10 flex items-center justify-center rounded-full mb-2 ${
                  isCompleted 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-400'
                } ${
                  isCurrent 
                    ? 'ring-4 ring-primary/20' 
                    : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-medium ${isCompleted ? 'text-primary' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceOrderStatus;
