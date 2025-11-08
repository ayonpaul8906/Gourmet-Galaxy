package com.foodorder.food_backend.controller;

import com.foodorder.food_backend.model.Food;
import com.foodorder.food_backend.service.FoodService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*") 
public class FoodController {

    private final FoodService foodService;

    public FoodController(FoodService foodService) {
        this.foodService = foodService;
    }

    @PostMapping
public String addFood(@RequestBody Food food) throws ExecutionException, InterruptedException {
    System.out.println("Incoming Food: " + food);
    return foodService.addFood(food);
}


    @GetMapping
    public List<Food> getAllFoods() throws ExecutionException, InterruptedException {
        return foodService.getAllFoods();
    }
}

