// Tour Package Types
export interface Activity {
  name: string;
  description: string;
  duration: string;
  included: boolean;
}

export interface TourPackage {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  imageUrl: string;
  activities: Activity[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional fields for enhanced display
  location?: string;
  groupSize?: string;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  highlights?: string[];
  isPopular?: boolean;
}

export interface TourPackageFormData {
  title: string;
  description: string;
  price: number;
  duration: string;
  imageUrl: string;
  activities: Activity[];
}
