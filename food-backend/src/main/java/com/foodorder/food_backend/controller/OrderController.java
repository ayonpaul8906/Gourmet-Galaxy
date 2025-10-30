package com.foodorder.food_backend.controller;

import com.foodorder.food_backend.model.CartItem;
import com.foodorder.food_backend.model.Order;
import com.foodorder.food_backend.service.OrderService;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/place")
    public Map<String, Object> placeOrder(@RequestBody Map<String, Object> payload) {
        try {
            String userId = (String) payload.get("userId");
            String address = (String) payload.get("address");
            double totalAmount = ((Number) payload.get("totalAmount")).doubleValue();

            // Convert items from Map to CartItem list
            List<CartItem> items = ((List<?>) payload.get("items")).stream()
                    .map(item -> {
                        Map<?, ?> map = (Map<?, ?>) item;
                        CartItem cartItem = new CartItem();
                        cartItem.setId((String) map.get("id"));
                        cartItem.setName((String) map.get("name"));
                        cartItem.setPrice(((Number) map.get("price")).doubleValue());
                        cartItem.setQuantity(((Number) map.get("quantity")).intValue());
                        cartItem.setImage((String) map.get("image"));
                        return cartItem;
                    }).toList();

            return orderService.placeOrder(userId, items, address, totalAmount);
        } catch (Exception e) {
            return Map.of("status", "error", "message", e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public List<Map<String, Object>> getOrders(@PathVariable String userId) {
        List<Order> orders = orderService.getOrdersByUser(userId);

        return orders.stream()
                .map(order -> Map.of(
                        "id", order.getId(),
                        "totalAmount", order.getTotalAmount(),
                        "address", order.getAddress(),
                        "date", order.getOrderDate().toString(),
                        "status", order.getStatus()
                )).toList();
    }
}
