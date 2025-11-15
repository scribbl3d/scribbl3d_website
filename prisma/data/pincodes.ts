export interface PincodeData {
  pincode: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}

// This is sample data. Replace this with your complete dataset.
export const pincodeData: PincodeData[] = [
  {
    pincode: "110041", // Your warehouse pincode
    latitude: 28.5355,
    longitude: 77.275,
    city: "New Delhi",
    state: "Delhi",
  },
  {
    pincode: "400001", // Mumbai GPO
    latitude: 18.9373,
    longitude: 72.8362,
    city: "Mumbai",
    state: "Maharashtra",
  },
  {
    pincode: "700001", // Kolkata GPO
    latitude: 22.5726,
    longitude: 88.3639,
    city: "Kolkata",
    state: "West Bengal",
  },
  {
    pincode: "600001", // Chennai GPO
    latitude: 13.0827,
    longitude: 80.2707,
    city: "Chennai",
    state: "Tamil Nadu",
  },
  // Add more pincode data here
];
