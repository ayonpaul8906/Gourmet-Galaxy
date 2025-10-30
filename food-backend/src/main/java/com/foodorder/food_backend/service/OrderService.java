package com.foodorder.food_backend.service;

import com.foodorder.food_backend.model.CartItem;
import com.foodorder.food_backend.model.Order;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class OrderService {

    private final Firestore db = FirestoreClient.getFirestore();
    private final CartService cartService;

    public OrderService(CartService cartService) {
        this.cartService = cartService;
    }

    public Map<String, Object> placeOrder(String userId, List<CartItem> items, String address, double totalAmount) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Prepare order data
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("userId", userId);
            orderData.put("items", items);
            orderData.put("address", address);
            orderData.put("totalAmount", totalAmount);
            orderData.put("orderDate", LocalDateTime.now().toString());
            orderData.put("status", "Placed");

            // Store inside "users/{userId}/orders"
            CollectionReference ordersRef = db.collection("users").document(userId).collection("orders");
            DocumentReference newOrderRef = ordersRef.document();
            newOrderRef.set(orderData).get();

            // Clear user’s cart after placing order
            cartService.clearCart(userId);

            response.put("status", "success");
            response.put("orderId", newOrderRef.getId());
        } catch (Exception e) {
            e.printStackTrace();
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }

    public List<Order> getOrdersByUser(String userId) {
        List<Order> orders = new ArrayList<>();
        try {
            CollectionReference ordersRef = db.collection("users").document(userId).collection("orders");
            ApiFuture<QuerySnapshot> future = ordersRef.get();

            for (DocumentSnapshot doc : future.get().getDocuments()) {
                Order order = new Order();
                order.setId(doc.getId());
                order.setUserId(doc.getString("userId"));
                order.setAddress(doc.getString("address"));
                order.setTotalAmount(doc.getDouble("totalAmount"));
                order.setOrderDate(LocalDateTime.parse(doc.getString("orderDate")));
                order.setStatus(doc.getString("status"));

                // Convert Firestore items back to CartItem list
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
}
