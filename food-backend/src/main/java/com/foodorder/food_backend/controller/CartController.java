package com.foodorder.food_backend.controller;

import com.foodorder.food_backend.model.CartItem;
import com.foodorder.food_backend.service.CartService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public Map<String, Object> getCartItems(@PathVariable String userId) {
        List<CartItem> items = cartService.getCartItems(userId);
        return Map.of("items", items);
    }

    @PostMapping("/{userId}/add")
    public Map<String, Object> addItem(@PathVariable String userId, @RequestBody CartItem item) {
        return cartService.addToCart(userId, item);
    }

    @PutMapping("/{userId}/update")
    public Map<String, Object> updateQuantity(@PathVariable String userId, @RequestBody Map<String, Object> payload) {
        String id = (String) payload.get("id");
        int quantity = (int) payload.get("quantity");
        return cartService.updateQuantity(userId, id, quantity);
    }

    @DeleteMapping("/{userId}/remove/{id}")
    public Map<String, Object> removeItem(@PathVariable String userId, @PathVariable String id) {
        return cartService.removeItem(userId, id);
    }

    @DeleteMapping("/{userId}/clear")
    public Map<String, Object> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
        return Map.of("status", "success");
    }
}
