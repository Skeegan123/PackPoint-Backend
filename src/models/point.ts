export interface Point {
  id: number;
  firebase_uid: string;
  name: string;
  description: string;
  rating: number;
  noise_level: number;
  busy_level: number;
  wifi: boolean;
  amenities: string[];
  address: string;
  location: { lat: number; lng: number };
  image_url: string;
}
