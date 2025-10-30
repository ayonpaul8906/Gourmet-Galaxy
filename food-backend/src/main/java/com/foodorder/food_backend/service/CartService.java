package com.foodorder.food_backend.service;

import com.foodorder.food_backend.model.CartItem;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CartService {

    private Firestore db = FirestoreClient.getFirestore();

    public List<CartItem> getCartItems(String userId) {
        try {
            CollectionReference cartRef = db.collection("users").document(userId).collection("cart");
            ApiFuture<QuerySnapshot> query = cartRef.get();
            List<QueryDocumentSnapshot> docs = query.get().getDocuments();

            List<CartItem> items = new ArrayList<>();
            for (QueryDocumentSnapshot doc : docs) {
                items.add(doc.toObject(CartItem.class));
            }
            return items;
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    public Map<String, Object> addToCart(String userId, CartItem item) {
        Map<String, Object> response = new HashMap<>();
        try {
            CollectionReference cartRef = db.collection("users").document(userId).collection("cart");

            // Check if same item exists
            ApiFuture<QuerySnapshot> query = cartRef.whereEqualTo("name", item.getName())
                                                    .whereEqualTo("restaurant", item.getRestaurant()).get();
            List<QueryDocumentSnapshot> docs = query.get().getDocuments();

            if (!docs.isEmpty()) {
                DocumentReference docRef = docs.get(0).getReference();
                CartItem existing = docs.get(0).toObject(CartItem.class);
                existing.setQuantity(existing.getQuantity() + 1);
                docRef.set(existing);
                response.put("message", "Item quantity updated");
            } else {
                item.setId(UUID.randomUUID().toString());
                item.setQuantity(1);
                cartRef.document(item.getId()).set(item);
                response.put("message", "Item added to cart");
            }

            response.put("status", "success");
            response.put("cartItems", getCartItems(userId));
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }

    public Map<String, Object> updateQuantity(String userId, String id, int quantity) {
        Map<String, Object> response = new HashMap<>();
        try {
            DocumentReference docRef = db.collection("users").document(userId).collection("cart").document(id);

            if (quantity <= 0) {
                docRef.delete();
            } else {
                docRef.update("quantity", quantity);
            }

            response.put("status", "success");
            response.put("cartItems", getCartItems(userId));
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }

    public Map<String, Object> removeItem(String userId, String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            db.collection("users").document(userId).collection("cart").document(id).delete();
            response.put("status", "success");
            response.put("cartItems", getCartItems(userId));
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }

    public void clearCart(String userId) {
        try {
            CollectionReference cartRef = db.collection("users").document(userId).collection("cart");
            ApiFuture<QuerySnapshot> query = cartRef.get();
            for (QueryDocumentSnapshot doc : query.get().getDocuments()) {
                doc.getReference().delete();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
