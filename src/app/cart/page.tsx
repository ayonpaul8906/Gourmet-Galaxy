import CartPageClient from "./CartPageClient";
import { cartItems } from "@/lib/data";

export default function CartPage() {
    return (
        <CartPageClient initialItems={cartItems} />
    )
}
