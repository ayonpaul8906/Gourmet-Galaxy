// /lib/cartApi.ts
const BASE_URL = "http://localhost:8080/api/cart";

function getUserId() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.warn("⚠️ userId not found in localStorage — using guest");
    return "guest"; // fallback if not logged in
  }
  return userId;
}

export async function addToCart(item: any) {
  const userId = getUserId();
  const res = await fetch(`${BASE_URL}/${userId}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });

  if (!res.ok) throw new Error(`Failed to add to cart: ${res.status}`);
  return await res.json();
}

export async function getCartItems() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.warn("⚠️ userId not found in localStorage — using guest");
    return { items: [] };
  }

  const res = await fetch(`http://localhost:8080/api/cart/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch cart items");
  return await res.json();
}


export async function clearCart() {
  const userId = getUserId();
  const res = await fetch(`${BASE_URL}/${userId}/clear`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to clear cart");
  return await res.json();
}

export async function removeItem(id: string) {
  const userId = getUserId();
  const res = await fetch(`${BASE_URL}/${userId}/remove/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove item");
  return await res.json();
}

export async function updateQuantity(id: string, quantity: number) {
  const userId = getUserId();
  const res = await fetch(`${BASE_URL}/${userId}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, quantity }),
  });
  if (!res.ok) throw new Error("Failed to update quantity");
  return await res.json();
}
