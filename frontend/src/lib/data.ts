import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  restaurant: string;
  imageId: string;
  isTrending: boolean;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
}

export type OrderStatus = 'Cooking' | 'On the way' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: {
    foodId: string;
    quantity: number;
  }[];
}

export const categories: Category[] = [
  { id: 'cat-1', name: 'Pizza', emoji: '🍕' },
  { id: 'cat-2', name: 'Burgers', emoji: '🍔' },
  { id: 'cat-3', name: 'Sushi', emoji: '🍣' },
  { id: 'cat-4', name: 'Pasta', emoji: '🍝' },
  { id: 'cat-5', name: 'Salads', emoji: '🥗' },
  { id: 'cat-6', name: 'Mexican', emoji: '🌮' },
];

export const restaurants: Restaurant[] = [
  { id: 'res-1', name: 'Pizza Planet', cuisine: 'Italian', rating: 4.5 },
  { id: 'res-2', name: 'Burger Barn', cuisine: 'American', rating: 4.2 },
  { id: 'res-3', name: 'Sushi Station', cuisine: 'Japanese', rating: 4.8 },
];

export const foodItems: FoodItem[] = [
  {
    id: 'food-1',
    name: 'Cosmic Pepperoni',
    description: 'Classic pepperoni pizza with a cosmic twist.',
    price: 14.99,
    category: 'Pizza',
    restaurant: 'Pizza Planet',
    imageId: 'pizza-1',
    isTrending: true,
    rating: 4.7,
  },
  {
    id: 'food-2',
    name: 'Galaxy Burger',
    description: 'A juicy cheeseburger that is out of this world.',
    price: 12.5,
    category: 'Burgers',
    restaurant: 'Burger Barn',
    imageId: 'burger-1',
    isTrending: true,
    rating: 4.5,
  },
  {
    id: 'food-3',
    name: 'Nebula Noodles',
    description: 'Creamy spaghetti bolognese with a secret sauce.',
    price: 16.0,
    category: 'Pasta',
    restaurant: 'Pizza Planet',
    imageId: 'pasta-1',
    isTrending: false,
    rating: 4.6,
  },
  {
    id: 'food-4',
    name: 'Supernova Sushi',
    description: 'An explosive mix of fresh sushi rolls.',
    price: 22.99,
    category: 'Sushi',
    restaurant: 'Sushi Station',
    imageId: 'sushi-1',
    isTrending: true,
    rating: 4.9,
  },
  {
    id: 'food-5',
    name: 'Meteor Tacos',
    description: 'Spicy chicken tacos that will rock your world.',
    price: 11.5,
    category: 'Mexican',
    restaurant: 'Burger Barn',
    imageId: 'tacos-1',
    isTrending: false,
    rating: 4.3,
  },
  {
    id: 'food-6',
    name: 'Garden of Eden Salad',
    description: 'A fresh and healthy Greek salad.',
    price: 9.99,
    category: 'Salads',
    restaurant: 'Pizza Planet',
    imageId: 'salad-1',
    isTrending: false,
    rating: 4.1,
  },
   {
    id: 'food-7',
    name: 'Black Hole Brownie',
    description: 'A dense, rich chocolate brownie slice.',
    price: 7.5,
    category: 'Desserts',
    restaurant: 'Burger Barn',
    imageId: 'dessert-1',
    isTrending: true,
    rating: 4.8,
  },
  {
    id: 'food-8',
    name: 'Sirius Steak',
    description: 'A perfectly grilled, tender steak.',
    price: 28.0,
    category: 'Steak',
    restaurant: 'Burger Barn',
    imageId: 'steak-1',
    isTrending: false,
    rating: 4.9,
  },
];

export const orders: Order[] = [
    {
        id: '#GG-12345',
        date: '2023-10-26T10:00:00Z',
        status: 'Delivered',
        total: 27.49,
        items: [
            { foodId: 'food-1', quantity: 1 },
            { foodId: 'food-7', quantity: 1 }
        ]
    },
    {
        id: '#GG-12346',
        date: '2023-10-27T12:30:00Z',
        status: 'On the way',
        total: 12.5,
        items: [
            { foodId: 'food-2', quantity: 1 }
        ]
    },
    {
        id: '#GG-12347',
        date: '2023-10-27T12:45:00Z',
        status: 'Cooking',
        total: 22.99,
        items: [
            { foodId: 'food-4', quantity: 1 }
        ]
    },
     {
        id: '#GG-12344',
        date: '2023-10-25T18:00:00Z',
        status: 'Cancelled',
        total: 16.0,
        items: [
            { foodId: 'food-3', quantity: 1 }
        ]
    }
];

export const cartItems = [
    { ...foodItems[0], quantity: 1 },
    { ...foodItems[2], quantity: 2 },
];
