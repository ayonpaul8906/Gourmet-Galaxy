export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  restaurant?: string;
}

export interface CartResponse {
  status: string;
  cartItems?: CartItem[];
  message?: string;
  differentRestaurant?: boolean;
}

export interface User {
  uid: string;
  email: string;
  isFirstOrder: boolean;
  totalOrders: number;
  usedDiscounts: string[];
}