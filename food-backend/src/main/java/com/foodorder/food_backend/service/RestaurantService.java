package com.foodorder.food_backend.service;

import com.foodorder.food_backend.model.Restaurant;
import com.foodorder.food_backend.model.Food;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class RestaurantService {

    private final Firestore db;

    public RestaurantService(Firestore db) {
        this.db = db;
    }

    public String addRestaurant(Restaurant restaurant) throws ExecutionException, InterruptedException {
        ApiFuture<DocumentReference> future = db.collection("restaurants").add(restaurant);
        return future.get().getId();
    }

    public List<Restaurant> getAllRestaurants() throws ExecutionException, InterruptedException {
        List<Restaurant> restaurants = new ArrayList<>();
        ApiFuture<QuerySnapshot> future = db.collection("restaurants").get();
        for (DocumentSnapshot doc : future.get().getDocuments()) {
            Restaurant restaurant = doc.toObject(Restaurant.class);
            restaurant.setId(doc.getId());
            restaurants.add(restaurant);
        }
        return restaurants;
    }

    // ✅ Add food directly into the 'menu' field
    public String addFoodToRestaurant(String restaurantId, Food food) throws ExecutionException, InterruptedException {
        DocumentReference restaurantRef = db.collection("restaurants").document(restaurantId);
        DocumentSnapshot snapshot = restaurantRef.get().get();

        if (!snapshot.exists()) {
            throw new RuntimeException("Restaurant not found with ID: " + restaurantId);
        }

        Restaurant restaurant = snapshot.toObject(Restaurant.class);
        if (restaurant != null) {
            List<Food> menu = restaurant.getMenu();
            if (menu == null) menu = new ArrayList<>();

            food.setId(java.util.UUID.randomUUID().toString());
            menu.add(food);

            restaurant.setMenu(menu);
            restaurantRef.set(restaurant);

            return "Food added successfully to menu.";
        }

        return "Failed to add food item.";
    }

    // ✅ Get menu from restaurant document
    public List<Food> getFoodsByRestaurant(String restaurantId) throws ExecutionException, InterruptedException {
        DocumentReference restaurantRef = db.collection("restaurants").document(restaurantId);
        DocumentSnapshot snapshot = restaurantRef.get().get();

        if (snapshot.exists()) {
            Restaurant restaurant = snapshot.toObject(Restaurant.class);
            return restaurant != null && restaurant.getMenu() != null
                    ? restaurant.getMenu()
                    : new ArrayList<>();
        }

        return new ArrayList<>();
    }
}
