package com.foodorder.food_backend.service;

import com.foodorder.food_backend.model.CartItem;
import com.foodorder.food_backend.model.Order;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Service
public class OrderService {

    private final Firestore db = FirestoreClient.getFirestore();
    private final CartService cartService;
    private final ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();

    // Keep references of scheduled tasks to cancel them later
    private final Map<String, List<ScheduledFuture<?>>> scheduledTasks = new ConcurrentHashMap<>();

    public OrderService(CartService cartService) {
        this.cartService = cartService;
        scheduler.initialize();
    }

    // ✅ Place new order under users/{userId}/orders/{orderId}
    public Map<String, Object> placeOrder(String userId, List<CartItem> items, String address, double totalAmount) {
        Map<String, Object> response = new HashMap<>();
        try {
            String orderId = UUID.randomUUID().toString();

            // Prepare clean serializable data for Firestore
            List<Map<String, Object>> serializedItems = new ArrayList<>();
            for (CartItem item : items) {
                Map<String, Object> itemMap = new HashMap<>();
                itemMap.put("id", item.getId());
                itemMap.put("name", item.getName());
                itemMap.put("price", item.getPrice());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("image", item.getImage());
                serializedItems.add(itemMap);
            }

            Map<String, Object> orderData = new HashMap<>();
            orderData.put("userId", userId);
            orderData.put("items", serializedItems);
            orderData.put("address", address);
            orderData.put("totalAmount", totalAmount);
            orderData.put("orderDate", LocalDateTime.now().toString());
            orderData.put("status", "Placed");

            // Store order
            DocumentReference orderRef = db.collection("users")
                    .document(userId)
                    .collection("orders")
                    .document(orderId);

            orderRef.set(orderData).get();

            // Clear user cart
            cartService.clearCart(userId);

            // 🔥 Schedule automatic status updates
            scheduleStatusUpdates(userId, orderId);

            response.put("status", "success");
            response.put("orderId", orderId);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ✅ Automatic status update simulation (Placed → Cooking → Out for Delivery → Delivered)
    private void scheduleStatusUpdates(String userId, String orderId) {
        List<ScheduledFuture<?>> tasks = new ArrayList<>();

        tasks.add(scheduler.schedule(() -> updateOrderStatus(userId, orderId, "Cooking"),
                new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(1))));
        tasks.add(scheduler.schedule(() -> updateOrderStatus(userId, orderId, "Out for Delivery"),
                new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3))));
        tasks.add(scheduler.schedule(() -> updateOrderStatus(userId, orderId, "Delivered"),
                new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(6))));

        scheduledTasks.put(orderId, tasks);
    }

    // ✅ Cancel order logic
    public Map<String, Object> cancelOrder(String userId, String orderId) {
        Map<String, Object> response = new HashMap<>();
        try {
            DocumentReference orderRef = db.collection("users")
                    .document(userId)
                    .collection("orders")
                    .document(orderId);

            DocumentSnapshot snapshot = orderRef.get().get();

            if (!snapshot.exists()) {
                response.put("status", "error");
                response.put("message", "Order not found");
                return response;
            }

            String currentStatus = snapshot.getString("status");
            if ("Delivered".equalsIgnoreCase(currentStatus)) {
                response.put("status", "error");
                response.put("message", "Order already delivered and cannot be cancelled");
                return response;
            }
            if ("Cancelled".equalsIgnoreCase(currentStatus)) {
                response.put("status", "error");
                response.put("message", "Order already cancelled");
                return response;
            }

            // Cancel all scheduled tasks for this order
            if (scheduledTasks.containsKey(orderId)) {
                for (ScheduledFuture<?> task : scheduledTasks.get(orderId)) {
                    task.cancel(false);
                }
                scheduledTasks.remove(orderId);
            }

            // Update Firestore
            Map<String, Object> updateData = new HashMap<>();
            updateData.put("status", "Cancelled");
            orderRef.update(updateData).get();

            System.out.println("🚫 Order " + orderId + " cancelled successfully");
            response.put("status", "success");
            response.put("message", "Order cancelled successfully");

        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }

    // ✅ Fetch all orders for a user
    public List<Order> getOrdersByUser(String userId) {
        List<Order> orders = new ArrayList<>();
        try {
            CollectionReference ordersRef = db.collection("users").document(userId).collection("orders");
            ApiFuture<QuerySnapshot> future = ordersRef.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            for (DocumentSnapshot doc : documents) {
                Order order = new Order();
                order.setId(doc.getId());
                order.setUserId(doc.getString("userId"));
                order.setAddress(doc.getString("address"));
                order.setTotalAmount(doc.getDouble("totalAmount"));
                order.setOrderDate(LocalDateTime.parse(doc.getString("orderDate")));
                order.setStatus(doc.getString("status"));

                List<Map<String, Object>> itemsList = (List<Map<String, Object>>) doc.get("items");
                if (itemsList != null) {
                    List<CartItem> cartItems = new ArrayList<>();
                    for (Map<String, Object> map : itemsList) {
                        CartItem item = new CartItem();
                        item.setId((String) map.get("id"));
                        item.setName((String) map.get("name"));
                        item.setPrice(((Number) map.get("price")).doubleValue());
                        item.setQuantity(((Number) map.get("quantity")).intValue());
                        item.setImage((String) map.get("image"));
                        cartItems.add(item);
                    }
                    order.setItems(cartItems);
                }

                orders.add(order);
            }

        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
        }

        return orders;
    }

    // ✅ Update order status inside users/{userId}/orders/{orderId}
    public void updateOrderStatus(String userId, String orderId, String newStatus) {
        try {
            DocumentReference orderRef = db.collection("users")
                    .document(userId)
                    .collection("orders")
                    .document(orderId);

            DocumentSnapshot snapshot = orderRef.get().get();
            if (!snapshot.exists()) return;

            String currentStatus = snapshot.getString("status");
            if ("Cancelled".equalsIgnoreCase(currentStatus)) {
                // Do not update cancelled orders
                System.out.println("⚠️ Order " + orderId + " already cancelled, skipping update.");
                return;
            }

            Map<String, Object> updateData = new HashMap<>();
            updateData.put("status", newStatus);
            orderRef.update(updateData).get();

            System.out.println("✅ Updated order " + orderId + " to status: " + newStatus);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
