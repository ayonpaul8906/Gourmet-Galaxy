const BASE_URL = "http://localhost:8080/api/order";

function getUserId() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.warn("⚠️ userId not found in localStorage — using guest");
    return "guest";
  }
  return userId;
}

// ✅ Place a new order
export async function placeOrder(address: string, items: any[], totalAmount: number) {
  const userId = getUserId();

  const payload = { userId, address, totalAmount, items };

  const res = await fetch(`${BASE_URL}/place`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to place order");
  return await res.json();
}

// ✅ Fetch user orders
export async function getUserOrders() {
  const userId = getUserId();

  const res = await fetch(`${BASE_URL}/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch orders");
  return await res.json();
}

// ✅ Update order status (optional for later tracking UI)
export async function updateOrderStatus(orderId: string, status: string) {
  const userId = getUserId();

  const res = await fetch(`${BASE_URL}/update-status/${userId}/${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to update order status");
  return await res.json();
}
