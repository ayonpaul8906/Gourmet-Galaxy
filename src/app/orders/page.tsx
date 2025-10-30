import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { orders, foodItems } from "@/lib/data";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
    const currentOrders = orders.filter(o => o.status === 'Cooking' || o.status === 'On the way');
    const pastOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');

    const OrderCard = ({ order }: { order: typeof orders[0] }) => {
        const orderItems = order.items.map(item => {
            const food = foodItems.find(f => f.id === item.foodId);
            return { ...food, quantity: item.quantity };
        });

        return (
            <Card className="glassmorphism w-full">
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="font-headline text-xl">{order.id}</CardTitle>
                        <CardDescription>{new Date(order.date).toLocaleDateString()}</CardDescription>
                    </div>
                    <OrderStatusBadge status={order.status} />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {orderItems.map(item => {
                            if (!item) return null;
                            const placeholder = PlaceHolderImages.find(p => p.id === item.imageId);
                            return (
                                <div key={item.id} className="flex items-center gap-4">
                                    {placeholder && (
                                        <Image src={placeholder.imageUrl} alt={item.name!} width={50} height={50} className="rounded-md object-cover" data-ai-hint={placeholder.imageHint} />
                                    )}
                                    <div className="flex-grow">
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">{formatPrice(item.price! * item.quantity!)}</p>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <Button variant="outline">Reorder</Button>
                    <p className="font-bold text-lg">Total: {formatPrice(order.total)}</p>
                </CardFooter>
            </Card>
        )
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
          <TabsTrigger value="current">Current Orders</TabsTrigger>
          <TabsTrigger value="past">Past Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="current" className="mt-6 space-y-6">
            {currentOrders.length > 0 ? currentOrders.map(order => <OrderCard key={order.id} order={order} />) : <p className="text-center text-muted-foreground py-8">No current orders.</p>}
        </TabsContent>
        <TabsContent value="past" className="mt-6 space-y-6">
            {pastOrders.length > 0 ? pastOrders.map(order => <OrderCard key={order.id} order={order} />) : <p className="text-center text-muted-foreground py-8">No past orders found.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
