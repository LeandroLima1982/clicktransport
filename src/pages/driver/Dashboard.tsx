
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import TransitionEffect from '@/components/TransitionEffect';
import DriverSidebar from '@/components/driver/DriverSidebar';
import DriverHeader from '@/components/driver/DriverHeader';
import DashboardContent from '@/components/driver/DashboardContent';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Map, Clock, CalendarClock, User, Car, Home, FileText, History, ChartBar } from 'lucide-react';
import { playNotificationSound } from '@/services/notifications/notificationService';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const DriverDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle notification badge
  const [hasNewOrders, setHasNewOrders] = useState(false);
  
  // Real-time notification simulation
  useEffect(() => {
    // Simulate a real-time notification after 5 seconds
    const timer = setTimeout(() => {
      if (activeTab !== 'orders') {
        setHasNewOrders(true);
        playNotificationSound();
        // Vibrate if supported
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        toast.success('Nova ordem de serviço disponível!', {
          description: 'Toque para visualizar detalhes',
          action: {
            label: 'Ver agora',
            onClick: () => {
              setActiveTab('orders');
              setHasNewOrders(false);
            }
          }
        });
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [activeTab]);
  
  // Reset notification badge when viewing orders
  useEffect(() => {
    if (activeTab === 'orders') {
      setHasNewOrders(false);
    }
  }, [activeTab]);
  
  if (isMobile) {
    return (
      <TransitionEffect>
        <div className="flex flex-col min-h-screen bg-[#1F1F1F] pb-16">
          <div className="app-header">
            <div className="flex justify-between items-center w-full">
              <div>
                <h1 className="text-lg font-bold text-white">
                  Olá, {user?.user_metadata.firstName || 'Motorista'}
                </h1>
                <p className="text-xs text-white/70">Dashboard do Motorista</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#F8D748] flex items-center justify-center text-[#1F1F1F]">
                    {user?.user_metadata.firstName?.[0] || 'M'}
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1F1F1F]"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* App-like timer display */}
          <div className="bg-[#262626] px-4 py-6 mb-4">
            <div className="timer-display">32:21</div>
            <div className="timer-label">Tempo de Espera</div>
            
            <div className="flex justify-center gap-3 mt-4">
              <button className="action-btn py-2 px-4 flex-1">
                <Map className="h-4 w-4 mr-2" />
                <span>Ver Mapa</span>
              </button>
              <button className="action-btn-secondary py-2 px-4 flex-1">
                <Clock className="h-4 w-4 mr-2" />
                <span>Status</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto px-4 pb-4">
            <DashboardContent />
          </div>
          
          {/* Mobile Tab Bar */}
          <div className="tab-bar pt-1">
            <Link 
              to="/driver/dashboard" 
              className={`tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Home className="h-5 w-5 mb-1" />
              <span className="text-xs">Dashboard</span>
            </Link>
            
            <Link 
              to="/driver/orders" 
              className={`tab-item ${activeTab === 'orders' ? 'active' : ''} relative`}
              onClick={() => {
                setActiveTab('orders');
                setHasNewOrders(false);
              }}
            >
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs">Ordens</span>
              {hasNewOrders && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Link>
            
            <Link 
              to="/driver/trips" 
              className={`tab-item ${activeTab === 'trips' ? 'active' : ''}`}
              onClick={() => setActiveTab('trips')}
            >
              <Car className="h-5 w-5 mb-1" />
              <span className="text-xs">Viagens</span>
            </Link>
            
            <Link 
              to="/driver/profile" 
              className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User className="h-5 w-5 mb-1" />
              <span className="text-xs">Perfil</span>
            </Link>
          </div>
        </div>
      </TransitionEffect>
    );
  }
  
  // Desktop layout
  return (
    <TransitionEffect>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DriverSidebar />
          
          <div className="flex-1 flex flex-col">
            <DriverHeader />
            <DashboardContent />
          </div>
        </div>
      </SidebarProvider>
    </TransitionEffect>
  );
};

export default DriverDashboardPage;
