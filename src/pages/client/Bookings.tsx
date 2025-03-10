
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Bookings: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();

  // Mock data for bookings - in a real application, this would come from Supabase
  const bookings = [
    {
      id: '1',
      date: '2024-03-20',
      time: '14:00',
      origin: 'Aeroporto Internacional de Guarulhos',
      destination: 'Hotel Maksoud Plaza',
      status: 'confirmed',
      price: 'R$ 150,00'
    },
    {
      id: '2',
      date: '2024-04-05',
      time: '10:30',
      origin: 'Hotel Maksoud Plaza',
      destination: 'Aeroporto Internacional de Guarulhos',
      status: 'pending',
      price: 'R$ 150,00'
    }
  ];

  if (!user || userRole !== 'client') {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
        <p className="mb-6">Você precisa estar logado como cliente para acessar esta página.</p>
        <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
      </div>
    );
  }

  return (
    <TransitionEffect>
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8">Minhas Reservas</h1>
        
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-lg mb-4">Você ainda não possui reservas.</p>
              <Button onClick={() => navigate('/')}>Fazer uma reserva</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-primary/5 pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Reserva #{booking.id}</CardTitle>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                    </span>
                  </div>
                  <CardDescription>
                    {booking.price}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Data</p>
                        <p className="text-sm text-muted-foreground">{booking.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Horário</p>
                        <p className="text-sm text-muted-foreground">{booking.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Origem</p>
                        <p className="text-sm text-muted-foreground">{booking.origin}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Destino</p>
                        <p className="text-sm text-muted-foreground">{booking.destination}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6 space-x-3">
                    <Button variant="outline">Ver Detalhes</Button>
                    {booking.status === 'pending' && (
                      <Button>Confirmar Pagamento</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TransitionEffect>
  );
};

export default Bookings;
