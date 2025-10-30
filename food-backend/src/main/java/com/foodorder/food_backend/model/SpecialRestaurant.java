package com.foodorder.food_backend.model;

public class SpecialRestaurant extends Restaurant {

    private String specialty;

    public SpecialRestaurant(String name, String location, String specialty) {
        super(name, location, null);
        this.specialty = specialty;
    }

    @Override
    public void displayInfo() {
        System.out.println("Special Restaurant: " + getName() +
                " | Location: " + getLocation() +
                " | Specialty: " + specialty);
    }
}
