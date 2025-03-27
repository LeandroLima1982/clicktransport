
export const MAPBOX_TOKEN = 'pk.eyJ1IjoiaW50ZWdyYXRpb25zIiwiYSI6ImNsZXhyYTB3bDBzZHQzeG82ZW04Z2lzdHIifQ.Gn1IoGg-zRmgmZxNWLdMHw';

export const fetchAddressSuggestions = async (query: string) => {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=br&types=address,place,locality,region&access_token=${MAPBOX_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    throw error;
  }
};
