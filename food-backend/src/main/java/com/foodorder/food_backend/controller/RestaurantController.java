package com.foodorder.food_backend.controller;

import com.foodorder.food_backend.model.Restaurant;
import com.foodorder.food_backend.model.Food;
import com.foodorder.food_backend.service.RestaurantService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*") 
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @PostMapping
    public String addRestaurant(@RequestBody Restaurant restaurant) throws ExecutionException, InterruptedException {
        return restaurantService.addRestaurant(restaurant);
    }

    @GetMapping
    public List<Restaurant> getAllRestaurants() throws ExecutionException, InterruptedException {
        return restaurantService.getAllRestaurants();
    }

    @PostMapping("/{restaurantId}/menu")
    public String addFoodToRestaurant(@PathVariable String restaurantId, @RequestBody Food food)
            throws ExecutionException, InterruptedException {
        return restaurantService.addFoodToRestaurant(restaurantId, food);
    }

    @GetMapping("/{restaurantId}/menu")
    public List<Food> getRestaurantMenu(@PathVariable String restaurantId)
            throws ExecutionException, InterruptedException {
        return restaurantService.getFoodsByRestaurant(restaurantId);
    }
}
