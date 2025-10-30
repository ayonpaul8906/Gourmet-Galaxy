package com.foodorder.food_backend.service;

import com.foodorder.food_backend.model.User;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;
import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {
    private final Firestore firestore;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(Firestore firestore) {
        this.firestore = firestore;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // Create user (signup)
    public String createUser(String name, String email, String plainPassword) throws ExecutionException, InterruptedException {
        // Check if user exists
        ApiFuture<QuerySnapshot> query = firestore.collection("users").whereEqualTo("email", email).get();
        if (!query.get().isEmpty()) {
            return "EXISTS";
        }

        String hash = passwordEncoder.encode(plainPassword);
        DocumentReference docRef = firestore.collection("users").document();
        User user = new User(docRef.getId(), name, email, hash, "USER");
        ApiFuture<WriteResult> write = docRef.set(user);
        return write.get().getUpdateTime().toString();
    }

    // Authenticate user (login) - returns User object if password matches, else null
    public User authenticate(String email, String plainPassword) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> query = firestore.collection("users").whereEqualTo("email", email).get();
        QuerySnapshot snapshot = query.get();
        if (snapshot.isEmpty()) return null;

        DocumentSnapshot doc = snapshot.getDocuments().get(0);
        User user = doc.toObject(User.class);
        // Ensure id is set (Firestore may not fill DocumentId automatically for toObject)
        if (user.getId() == null) user.setId(doc.getId());

        if (user != null && passwordEncoder.matches(plainPassword, user.getPasswordHash())) {
            return user;
        }
        return null;
    }

    // Get user by id
    public User getUserById(String userId) throws ExecutionException, InterruptedException {
        DocumentReference ref = firestore.collection("users").document(userId);
        ApiFuture<DocumentSnapshot> future = ref.get();
        DocumentSnapshot doc = future.get();
        if (!doc.exists()) return null;
        User user = doc.toObject(User.class);
        if (user.getId() == null) user.setId(doc.getId());
        return user;
    }
}

