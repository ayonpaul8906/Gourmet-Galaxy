package com.foodorder.food_backend.service;

import com.foodorder.food_backend.model.Food;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class FoodService {
    private final Firestore firestore;

    public FoodService(Firestore firestore) {
        this.firestore = firestore;
    }

    // Add food
    public String addFood(Food food) throws ExecutionException, InterruptedException {
        DocumentReference docRef = firestore.collection("foods").document();
        food.setId(docRef.getId());
        ApiFuture<WriteResult> result = docRef.set(food);
        return "✅ Food added at: " + result.get().getUpdateTime();
    }

    // Get all foods
    public List<Food> getAllFoods() throws ExecutionException, InterruptedException {
        List<Food> foods = new ArrayList<>();
        ApiFuture<QuerySnapshot> query = firestore.collection("foods").get();
        QuerySnapshot snapshot = query.get();

        for (DocumentSnapshot doc : snapshot.getDocuments()) {
            Food food = doc.toObject(Food.class);
            foods.add(food);
        }
        return foods;
    }
}

