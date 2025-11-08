package com.foodorder.food_backend.model;

import com.google.cloud.firestore.annotation.DocumentId;

public class Food {
    @DocumentId
    private String id;
    private String name;
    private double price;
    private String category;
    private String imageUrl; 

    public Food() {}

    public Food(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public Food(String id, String name, double price, String category, String imageUrl) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    @Override
    public String toString() {
        return "Food{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", category='" + category + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                '}';
    }

    public void displayInfo() {
        System.out.println("Food: " + name + " | Price: " + price);
    }

    public void displayInfo(String currency) {
        System.out.println("Food: " + name + " | Price: " + price + " " + currency);
    }
}
