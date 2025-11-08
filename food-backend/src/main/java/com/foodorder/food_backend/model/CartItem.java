package com.foodorder.food_backend.model;

public class CartItem {
    private String id;
    private String name;
    private double price;
    private String imageUrl;
    private String restaurant;
    private int quantity;

    public CartItem() {}

    public CartItem(String id, String name, double price, String imageUrl, String restaurant, int quantity) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
        this.restaurant = restaurant;
        this.quantity = quantity;
    }

    private String image; 

public String getImage() {
    return image;
}

public void setImage(String image) {
    this.image = image;
}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getRestaurant() { return restaurant; }
    public void setRestaurant(String restaurant) { this.restaurant = restaurant; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}
