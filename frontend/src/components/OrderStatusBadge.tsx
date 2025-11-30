import { Badge } from "@/components/ui/badge";
import { OrderStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const statusStyles: Record<OrderStatus, string> = {
  'Cooking': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'On the way': 'bg-blue-500/20 text-blue-400 border-blue-500/30 secondary-gradient text-white',
  'Delivered': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <Badge className={cn("capitalize", statusStyles[status])}>
      {status}
    </Badge>
  );
}
