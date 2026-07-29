// /lib/cartApi.ts
const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/cart`;
const LOCAL_CART_KEY = "gourmet_galaxy_cart";

export function getUserId(): string {
  if (typeof window === "undefined") return "guest";
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = "guest";
    localStorage.setItem("userId", userId);
  }
  return userId;
}

export function getLocalCart(): any[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalCart(items: any[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart_updated"));
  } catch (e) {
    console.error("Error saving local cart:", e);
  }
}

export async function addToCart(item: any) {
  const userId = getUserId();
  const currentItems = getLocalCart();

  // Check if adding from different restaurant
  if (
    currentItems.length > 0 &&
    item.restaurant &&
    currentItems[0].restaurant &&
    currentItems[0].restaurant !== item.restaurant
  ) {
    return { differentRestaurant: true };
  }

  const existingIdx = currentItems.findIndex(
    (i) =>
      (i.id && item.id && i.id === item.id) ||
      (i.name === item.name && i.restaurant === item.restaurant)
  );

  let updatedItems = [...currentItems];
  if (existingIdx > -1) {
    updatedItems[existingIdx].quantity =
      (updatedItems[existingIdx].quantity || 1) + 1;
  } else {
    updatedItems.push({
      id: item.id || `item-${Date.now()}`,
      name: item.name,
      price: item.price,
      quantity: 1,
      restaurant: item.restaurant,
      imageUrl: item.imageUrl,
    });
  }

  saveLocalCart(updatedItems);

  // Background API Sync
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BASE_URL}/${userId}/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        saveLocalCart(data.items);
        return { status: "success", items: data.items, cartItems: data.items };
      }
    }
  } catch (e) {
    // Graceful offline fallback
  }

  return { status: "success", items: updatedItems, cartItems: updatedItems };
}

export async function getCartItems() {
  const userId = getUserId();
  const localItems = getLocalCart();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BASE_URL}/${userId}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items)) {
        saveLocalCart(data.items);
        return data;
      }
    }
  } catch (e) {
    // Graceful offline fallback
  }

  return { items: localItems };
}

export async function clearCart() {
  const userId = getUserId();
  saveLocalCart([]);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    await fetch(`${BASE_URL}/${userId}/clear`, {
      method: "DELETE",
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (e) {
    // Graceful fallback
  }

  return { status: "success", items: [], cartItems: [] };
}

export async function removeItem(id: string) {
  const userId = getUserId();
  const currentItems = getLocalCart();
  const updatedItems = currentItems.filter((i) => i.id !== id && i.name !== id);
  saveLocalCart(updatedItems);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BASE_URL}/${userId}/remove/${id}`, {
      method: "DELETE",
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        saveLocalCart(data.items);
        return { status: "success", items: data.items, cartItems: data.items };
      }
    }
  } catch (e) {
    // Graceful fallback
  }

  return { status: "success", items: updatedItems, cartItems: updatedItems };
}

export async function updateQuantity(id: string, quantity: number) {
  const userId = getUserId();
  const currentItems = getLocalCart();

  let updatedItems: any[];
  if (quantity <= 0) {
    updatedItems = currentItems.filter((i) => i.id !== id && i.name !== id);
  } else {
    updatedItems = currentItems.map((i) =>
      i.id === id || i.name === id ? { ...i, quantity } : i
    );
  }
  saveLocalCart(updatedItems);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${BASE_URL}/${userId}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, quantity }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        saveLocalCart(data.items);
        return { status: "success", items: data.items, cartItems: data.items };
      }
    }
  } catch (e) {
    // Graceful fallback
  }

  return { status: "success", items: updatedItems, cartItems: updatedItems };
}
