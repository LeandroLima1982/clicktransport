import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface TripTypeTabsProps {
  value: 'oneway' | 'roundtrip';
  onChange: (value: 'oneway' | 'roundtrip') => void;
}
const TripTypeTabs: React.FC<TripTypeTabsProps> = ({
  value,
  onChange
}) => {
  return <Tabs defaultValue={value} className="w-[200px]" onValueChange={value => onChange(value as 'oneway' | 'roundtrip')}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="oneway">Somente Ida</TabsTrigger>
        <TabsTrigger value="roundtrip">Ida e Volta</TabsTrigger>
      </TabsList>
    </Tabs>;
};
export default TripTypeTabs;