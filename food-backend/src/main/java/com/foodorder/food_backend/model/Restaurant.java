package com.foodorder.food_backend.model;

import com.google.cloud.firestore.annotation.DocumentId;
import java.util.ArrayList;
import java.util.List;

public class Restaurant {

    @DocumentId
    private String id;
    private String name;
    private String location;
    private String imageUrl;
    private List<Food> menu = new ArrayList<>();

    // ✅ Default constructor
    public Restaurant() {}

    // ✅ Overloaded constructors
    public Restaurant(String name) {
        this.name = name;
    }

    public Restaurant(String name, String location, String imageUrl) {
        this.name = name;
        this.location = location;
        this.imageUrl = imageUrl;
    }

    // ✅ Inner Class (Manager)
    public class Manager {
        private String managerName;

        public Manager(String managerName) {
            this.managerName = managerName;
        }

        public void manageRestaurant() {
            System.out.println(managerName + " is managing " + name);
        }
    }

    // ✅ Add food to menu (Overloaded methods)
    public void addFood(Food food) {
        menu.add(food);
    }

    public void addFood(String name, double price) {
        menu.add(new Food(name, price));
    }

    // ✅ Example of Polymorphism via method overriding
    public void displayInfo() {
        System.out.println("Restaurant: " + name + " | Location: " + location);
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public List<Food> getMenu() { return menu; }
    public void setMenu(List<Food> menu) { this.menu = menu; }

    @Override
    public String toString() {
        return "Restaurant{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", location='" + location + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", menu=" + menu +
                '}';
    }
}
