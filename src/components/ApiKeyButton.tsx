
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, KeyRound } from 'lucide-react';
import MapApiKeyForm from './MapApiKeyForm';
import { updateGoogleMapsApiKey } from '@/utils/updateApiKey';

const ApiKeyButton: React.FC = () => {
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);

  const handleSaveApiKey = (apiKey: string) => {
    updateGoogleMapsApiKey(apiKey);
  };

  return (
    <>
      <Button 
        variant="default" 
        size="sm" 
        className="gap-1 bg-amber-500 hover:bg-amber-600 text-white" 
        onClick={() => setShowApiKeyForm(true)}
      >
        <KeyRound className="h-4 w-4" />
        <span>Configurar API Maps</span>
      </Button>
      
      <MapApiKeyForm 
        open={showApiKeyForm} 
        onOpenChange={setShowApiKeyForm}
        onSaveApiKey={handleSaveApiKey}
      />
    </>
  );
};

export default ApiKeyButton;
