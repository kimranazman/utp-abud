// Comprehensive locations dataset for Malaysia and international locations
import { malaysianCities } from './malaysia-cities';

// Combine Malaysian cities with international locations
export const locations = [
  // All Malaysian cities from comprehensive list
  ...malaysianCities,
  
  // Singapore
  { value: "singapore", label: "Singapore", country: "Singapore", state: "", city: "Singapore" },
  
  // United States - Major Cities
  { value: "new-york-ny-usa", label: "New York, NY, USA", country: "USA", state: "New York", city: "New York" },
  { value: "san-francisco-ca-usa", label: "San Francisco, CA, USA", country: "USA", state: "California", city: "San Francisco" },
  { value: "los-angeles-ca-usa", label: "Los Angeles, CA, USA", country: "USA", state: "California", city: "Los Angeles" },
  { value: "seattle-wa-usa", label: "Seattle, WA, USA", country: "USA", state: "Washington", city: "Seattle" },
  { value: "chicago-il-usa", label: "Chicago, IL, USA", country: "USA", state: "Illinois", city: "Chicago" },
  { value: "boston-ma-usa", label: "Boston, MA, USA", country: "USA", state: "Massachusetts", city: "Boston" },
  { value: "austin-tx-usa", label: "Austin, TX, USA", country: "USA", state: "Texas", city: "Austin" },
  { value: "houston-tx-usa", label: "Houston, TX, USA", country: "USA", state: "Texas", city: "Houston" },
  { value: "dallas-tx-usa", label: "Dallas, TX, USA", country: "USA", state: "Texas", city: "Dallas" },
  { value: "miami-fl-usa", label: "Miami, FL, USA", country: "USA", state: "Florida", city: "Miami" },
  { value: "denver-co-usa", label: "Denver, CO, USA", country: "USA", state: "Colorado", city: "Denver" },
  { value: "atlanta-ga-usa", label: "Atlanta, GA, USA", country: "USA", state: "Georgia", city: "Atlanta" },
  
  // United Kingdom
  { value: "london-uk", label: "London, UK", country: "United Kingdom", state: "England", city: "London" },
  { value: "manchester-uk", label: "Manchester, UK", country: "United Kingdom", state: "England", city: "Manchester" },
  { value: "birmingham-uk", label: "Birmingham, UK", country: "United Kingdom", state: "England", city: "Birmingham" },
  { value: "edinburgh-uk", label: "Edinburgh, UK", country: "United Kingdom", state: "Scotland", city: "Edinburgh" },
  { value: "glasgow-uk", label: "Glasgow, UK", country: "United Kingdom", state: "Scotland", city: "Glasgow" },
  { value: "bristol-uk", label: "Bristol, UK", country: "United Kingdom", state: "England", city: "Bristol" },
  
  // Australia
  { value: "sydney-australia", label: "Sydney, Australia", country: "Australia", state: "New South Wales", city: "Sydney" },
  { value: "melbourne-australia", label: "Melbourne, Australia", country: "Australia", state: "Victoria", city: "Melbourne" },
  { value: "brisbane-australia", label: "Brisbane, Australia", country: "Australia", state: "Queensland", city: "Brisbane" },
  { value: "perth-australia", label: "Perth, Australia", country: "Australia", state: "Western Australia", city: "Perth" },
  { value: "adelaide-australia", label: "Adelaide, Australia", country: "Australia", state: "South Australia", city: "Adelaide" },
  
  // Canada
  { value: "toronto-canada", label: "Toronto, Canada", country: "Canada", state: "Ontario", city: "Toronto" },
  { value: "vancouver-canada", label: "Vancouver, Canada", country: "Canada", state: "British Columbia", city: "Vancouver" },
  { value: "montreal-canada", label: "Montreal, Canada", country: "Canada", state: "Quebec", city: "Montreal" },
  { value: "calgary-canada", label: "Calgary, Canada", country: "Canada", state: "Alberta", city: "Calgary" },
  { value: "ottawa-canada", label: "Ottawa, Canada", country: "Canada", state: "Ontario", city: "Ottawa" },
  
  // Other Asian Countries
  { value: "tokyo-japan", label: "Tokyo, Japan", country: "Japan", state: "", city: "Tokyo" },
  { value: "osaka-japan", label: "Osaka, Japan", country: "Japan", state: "", city: "Osaka" },
  { value: "seoul-south-korea", label: "Seoul, South Korea", country: "South Korea", state: "", city: "Seoul" },
  { value: "hong-kong", label: "Hong Kong", country: "Hong Kong", state: "", city: "Hong Kong" },
  { value: "taipei-taiwan", label: "Taipei, Taiwan", country: "Taiwan", state: "", city: "Taipei" },
  { value: "bangkok-thailand", label: "Bangkok, Thailand", country: "Thailand", state: "", city: "Bangkok" },
  { value: "jakarta-indonesia", label: "Jakarta, Indonesia", country: "Indonesia", state: "", city: "Jakarta" },
  { value: "manila-philippines", label: "Manila, Philippines", country: "Philippines", state: "", city: "Manila" },
  { value: "ho-chi-minh-city-vietnam", label: "Ho Chi Minh City, Vietnam", country: "Vietnam", state: "", city: "Ho Chi Minh City" },
  { value: "hanoi-vietnam", label: "Hanoi, Vietnam", country: "Vietnam", state: "", city: "Hanoi" },
  
  // Europe
  { value: "berlin-germany", label: "Berlin, Germany", country: "Germany", state: "", city: "Berlin" },
  { value: "munich-germany", label: "Munich, Germany", country: "Germany", state: "", city: "Munich" },
  { value: "amsterdam-netherlands", label: "Amsterdam, Netherlands", country: "Netherlands", state: "", city: "Amsterdam" },
  { value: "paris-france", label: "Paris, France", country: "France", state: "", city: "Paris" },
  { value: "zurich-switzerland", label: "Zurich, Switzerland", country: "Switzerland", state: "", city: "Zurich" },
  { value: "stockholm-sweden", label: "Stockholm, Sweden", country: "Sweden", state: "", city: "Stockholm" },
  { value: "dublin-ireland", label: "Dublin, Ireland", country: "Ireland", state: "", city: "Dublin" },
  
  // Middle East
  { value: "dubai-uae", label: "Dubai, UAE", country: "UAE", state: "", city: "Dubai" },
  { value: "abu-dhabi-uae", label: "Abu Dhabi, UAE", country: "UAE", state: "", city: "Abu Dhabi" },
  { value: "doha-qatar", label: "Doha, Qatar", country: "Qatar", state: "", city: "Doha" },
  { value: "riyadh-saudi-arabia", label: "Riyadh, Saudi Arabia", country: "Saudi Arabia", state: "", city: "Riyadh" },
  
  // India
  { value: "mumbai-india", label: "Mumbai, India", country: "India", state: "", city: "Mumbai" },
  { value: "bangalore-india", label: "Bangalore, India", country: "India", state: "", city: "Bangalore" },
  { value: "delhi-india", label: "Delhi, India", country: "India", state: "", city: "Delhi" },
  { value: "hyderabad-india", label: "Hyderabad, India", country: "India", state: "", city: "Hyderabad" },
  { value: "pune-india", label: "Pune, India", country: "India", state: "", city: "Pune" },
  { value: "chennai-india", label: "Chennai, India", country: "India", state: "", city: "Chennai" },
  
  // South America
  { value: "sao-paulo-brazil", label: "São Paulo, Brazil", country: "Brazil", state: "", city: "São Paulo" },
  { value: "rio-de-janeiro-brazil", label: "Rio de Janeiro, Brazil", country: "Brazil", state: "", city: "Rio de Janeiro" },
  { value: "buenos-aires-argentina", label: "Buenos Aires, Argentina", country: "Argentina", state: "", city: "Buenos Aires" },
];

export type Location = {
  value: string;
  label: string;
  country: string;
  state: string;
  city: string;
};

// Popular locations (frequently used) - can be customized based on usage patterns
export const popularLocations = locations.filter(location => 
  ["kuala-lumpur-malaysia", "singapore", "new-york-ny-usa", "san-francisco-ca-usa", "london-uk", "sydney-australia", "toronto-canada", "tokyo-japan", "hong-kong", "dubai-uae"].includes(location.value)
);
