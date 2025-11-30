"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { formatPrice } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurant?: string;
}

interface Order {
  id: string;
  totalAmount: number;
  address: string;
  date: string;
  status: string;
  items: CartItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Get userId safely from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId");
      setUserId(storedUserId);
    }
  }, []);

  // ✅ Fetch orders from backend
  useEffect(() => {
    if (!userId) return;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

    fetch(`${API_BASE_URL}/api/order/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, [userId]);

  const currentOrders = orders.filter(
    (o) => o.status === "Cooking" || o.status === "Out for Delivery" || o.status === "Placed"
  );
  const pastOrders = orders.filter(
    (o) => o.status === "Delivered" || o.status === "Cancelled"
  );

  // ✅ Single Order Card Component
  const OrderCard = ({ order }: { order: Order }) => {
    return (
      <Card className="glassmorphism w-full">
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="font-headline text-xl">
              Order #{order.id.slice(0, 6).toUpperCase()}
            </CardTitle>
            <CardDescription>
              {new Date(order.date).toLocaleDateString()}
            </CardDescription>
          </div>
          <OrderStatusBadge status={order.status} />
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => {
              const placeholder = PlaceHolderImages.find(
                (p) => p.imageUrl === item.image
              );
              return (
                <div key={item.id} className="flex items-center gap-4">
                  {/* <Image
                    src={item.image || placeholder?.imageUrl || "/placeholder.png"}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  /> */}
                  <div className="flex-grow">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          {order.status === "Cooking" || order.status === "Out for Delivery"   ? (
            <Button
              onClick={() => router.push(`/track-order/${order.id}`)} 
              className="primary-gradient text-white"
            >
              Track Order
            </Button>
          ) : (
            <Button variant="outline">Reorder</Button>
          )}
          <p className="font-bold text-lg">
            Total: {formatPrice(order.totalAmount)}
          </p>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-6xl primary-gradient gradient-text">
          Your Order History
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Track your culinary journeys across the galaxy.
        </p>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current" className="hover:cursor-pointer">Current Orders</TabsTrigger>
          <TabsTrigger value="past" className="hover:cursor-pointer">Past Orders</TabsTrigger>
        </TabsList>

        {/* Current Orders */}
        <TabsContent value="current" className="mt-6 space-y-6">
          {currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No current orders.
            </p>
          )}
        </TabsContent>

        {/* Past Orders */}
        <TabsContent value="past" className="mt-6 space-y-6">
          {pastOrders.length > 0 ? (
            pastOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No past orders found.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
