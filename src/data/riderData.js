// Choices used during rider sign-up. Real delivery requests now come from Supabase.

export const TOWNS = ['Legazpi City', 'Daraga', 'Tabaco City', 'Ligao City', 'Camalig', 'Guinobatan', 'Sto. Domingo'];

export const VEHICLES = ['Motorcycle', 'Tricycle', 'Bicycle'];

export const DOCUMENTS = [
  { key: 'license', label: "Driver's license", motorOnly: true },
  { key: 'orcr', label: 'Vehicle OR/CR', motorOnly: true },
  { key: 'clearance', label: 'NBI or police clearance', motorOnly: false },
  { key: 'selfie', label: 'Selfie holding your ID', motorOnly: false },
];