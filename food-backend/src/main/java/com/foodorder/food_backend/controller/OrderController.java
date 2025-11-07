package com.foodorder.food_backend.controller;

import com.foodorder.food_backend.model.CartItem;
import com.foodorder.food_backend.model.Order;
import com.foodorder.food_backend.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/order")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ✅ Place new order
    @PostMapping("/place")
    public Map<String, Object> placeOrder(@RequestBody Map<String, Object> payload) {
        try {
            String userId = (String) payload.get("userId");
            String address = (String) payload.get("address");
            double totalAmount = ((Number) payload.get("totalAmount")).doubleValue();

            @SuppressWarnings("unchecked")
            List<CartItem> items = ((List<?>) payload.get("items")).stream()
                    .map(item -> {
                        Map<?, ?> map = (Map<?, ?>) item;
                        CartItem cartItem = new CartItem();
                        cartItem.setId((String) map.get("id"));
                        cartItem.setName((String) map.get("name"));
                        cartItem.setPrice(((Number) map.get("price")).doubleValue());
                        cartItem.setQuantity(((Number) map.get("quantity")).intValue());
                        cartItem.setImage((String) map.get("image"));
                        cartItem.setRestaurant((String) map.getOrDefault("restaurant", null));
                        return cartItem;
                    }).toList();

            return orderService.placeOrder(userId, items, address, totalAmount);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    // ✅ Fetch all orders for a user
    @GetMapping("/{userId}")
    public List<Map<String, Object>> getOrders(@PathVariable String userId) {
        List<Order> orders = orderService.getOrdersByUser(userId);

        return orders.stream().map(order -> {
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("id", order.getId());
            orderMap.put("totalAmount", order.getTotalAmount());
            orderMap.put("address", order.getAddress());
            orderMap.put("date", order.getOrderDate().toString());
            orderMap.put("status", order.getStatus());
            orderMap.put("items", order.getItems());
            return orderMap;
        }).toList();
    }

    // ✅ Update or cancel order status
    @PutMapping("/update-status/{userId}/{orderId}")
    public Map<String, Object> updateStatus(
            @PathVariable String userId,
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {

        String newStatus = body.get("status");

        try {
            // If user requests to cancel
            if ("Cancelled".equalsIgnoreCase(newStatus)) {
                orderService.cancelOrder(userId, orderId);
                return Map.of("status", "success", "message", "Order cancelled successfully");
            }

            // Otherwise, normal update
            orderService.updateOrderStatus(userId, orderId, newStatus);
            return Map.of("status", "success", "message", "Order status updated successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("status", "error", "message", e.getMessage());
        }
    }
}
