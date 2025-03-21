
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, KeyRound } from 'lucide-react';
import MapApiKeyForm from './MapApiKeyForm';
import { updateGoogleMapsApiKey } from '@/utils/updateApiKey';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const ApiKeyButton: React.FC = () => {
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const { user, userRole } = useAuth();

  const handleSaveApiKey = (apiKey: string) => {
    updateGoogleMapsApiKey(apiKey);
  };

  const isAdmin = userRole === 'admin';

  return (
    <>
      {isAdmin ? (
        <Button 
          variant="default" 
          size="sm" 
          className="gap-1 bg-amber-500 hover:bg-amber-600 text-white" 
          asChild
        >
          <Link to="/admin/dashboard?tab=api">
            <KeyRound className="h-4 w-4" />
            <span>Configurar API Maps</span>
          </Link>
        </Button>
      ) : (
        <Button 
          variant="default" 
          size="sm" 
          className="gap-1 bg-amber-500 hover:bg-amber-600 text-white" 
          onClick={() => setShowApiKeyForm(true)}
        >
          <KeyRound className="h-4 w-4" />
          <span>Configurar API Maps</span>
        </Button>
      )}
      
      {!isAdmin && (
        <MapApiKeyForm 
          open={showApiKeyForm} 
          onOpenChange={setShowApiKeyForm}
          onSaveApiKey={handleSaveApiKey}
        />
      )}
    </>
  );
};

export default ApiKeyButton;
