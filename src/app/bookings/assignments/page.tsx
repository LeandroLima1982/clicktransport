
import React from 'react';
import BookingAssignments from '@/components/booking/BookingAssignments';

export default function BookingAssignmentsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Atribuições de Reservas</h1>
      <p className="text-muted-foreground">Visualize quais empresas foram atribuídas para cada reserva.</p>
      
      <BookingAssignments />
    </div>
  );
}
