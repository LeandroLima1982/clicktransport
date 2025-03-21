
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
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
        variant="outline" 
        size="sm" 
        className="gap-1" 
        onClick={() => setShowApiKeyForm(true)}
      >
        <Settings className="h-4 w-4" />
        <span>API Maps</span>
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
