import type React from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  image: string;
  role: string;
}


export interface LocationData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  isVerified: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVerified: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  location: LocationData | null;
  setLocation: React.Dispatch<React.SetStateAction<LocationData | null>>;
  loadingLocation: boolean;
  city: string;
  setCity: React.Dispatch<React.SetStateAction<string>>;
  fetchCurrentLocation: () => void;
  cart: ICart[] | null;
  fetchCart: () => Promise<void>;
  fetchUser: () => Promise<void>;
  subTotal: number;
  quantity: number;
}

export interface IRestaurant {
  _id: string;
  name: string;
  description?: string;
  image: string;
  ownerId: string;
  phone: number;
  isVerified: boolean;
  deliveryTime: string;

  autoLocation: {
    type: "Point";
    coordinates: [number, number]; //[longitude, latitude]
    formattedAddress: string;
  };
  isOpen: boolean;
  createdAt: Date;
}

export interface IMenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICart {
  _id: string;
  userId: string;
  restaurantId: string | IRestaurant;
  itemId: string | IMenuItem;
  quantity: number;
  cretedAt: Date;
  updatedAt: Date;
}

export interface IOrder {
  _id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  riderId?: string | null;
  riderPhone: number | null;
  riderName: string | null;
  riderImage: string | null;
  distance: number;
  riderAmount: number;

  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];

  subtotal: number;
  deliveryFee: number;
  platfromFee: number;
  totalAmount: number;
  note?: string;

  addressId: string;

  deliveryAddress: {
    fromattedAddress: string;
    mobile: number;
    latitude: number;
    longitude: number;
  };

  status:
    | "placed"
    | "accepted"
    | "preparing"
    | "ready_for_rider"
    | "rider_assigned"
    | "picked_up"
    | "delivered"
    | "cancelled";

  paymentMethod: "razorpay" | "stripe";
  paymentStatus: "pending" | "paid" | "failed";

  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}
