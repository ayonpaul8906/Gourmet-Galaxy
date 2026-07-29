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

    // ---- Legacy email-based auth ----
    public String createUser(String name, String email, String plainPassword) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> query = firestore.collection("users").whereEqualTo("email", email).get();
        if (!query.get().isEmpty()) return "EXISTS";

        String hash = passwordEncoder.encode(plainPassword);
        DocumentReference docRef = firestore.collection("users").document();
        User user = new User(docRef.getId(), name, email, hash, "USER");
        ApiFuture<WriteResult> write = docRef.set(user);
        return write.get().getUpdateTime().toString();
    }

    public User authenticate(String email, String plainPassword) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> query = firestore.collection("users").whereEqualTo("email", email).get();
        QuerySnapshot snapshot = query.get();
        if (snapshot.isEmpty()) return null;

        DocumentSnapshot doc = snapshot.getDocuments().get(0);
        User user = docToUser(doc);

        if (user != null && passwordEncoder.matches(plainPassword, user.getPasswordHash())) return user;
        return null;
    }

    // ---- Phone-based auth (OTP flow) ----
    public User findByPhone(String phone) throws ExecutionException, InterruptedException {
        ApiFuture<QuerySnapshot> query = firestore.collection("users").whereEqualTo("phone", phone).get();
        QuerySnapshot snapshot = query.get();
        if (snapshot.isEmpty()) return null;

        DocumentSnapshot doc = snapshot.getDocuments().get(0);
        return docToUser(doc);
    }

    public User createUserByPhone(String phone, String name) throws ExecutionException, InterruptedException {
        // Verify not already exists
        User existing = findByPhone(phone);
        if (existing != null) return existing;

        DocumentReference docRef = firestore.collection("users").document();
        String id = docRef.getId();
        User user = new User(id, name, phone, "USER");

        // NOTE: Do NOT include "id" in the map — @DocumentId is inferred from the document path,
        // storing "id" as a field alongside @DocumentId causes a conflict on subsequent reads.
        Map<String, Object> data = new HashMap<>();
        data.put("name", name);
        data.put("phone", phone);
        data.put("role", "USER");
        data.put("createdAt", System.currentTimeMillis());

        docRef.set(data).get();
        return user;
    }

    public void updateUserName(String userId, String name) throws ExecutionException, InterruptedException {
        firestore.collection("users").document(userId).update("name", name).get();
    }

    public void updateUserPhone(String userId, String phone) throws ExecutionException, InterruptedException {
        firestore.collection("users").document(userId).update("phone", phone).get();
    }

    public User getUserById(String userId) throws ExecutionException, InterruptedException {
        DocumentReference ref = firestore.collection("users").document(userId);
        ApiFuture<DocumentSnapshot> future = ref.get();
        DocumentSnapshot doc = future.get();
        if (!doc.exists()) return null;
        return docToUser(doc);
    }

    /**
     * Safe document-to-User conversion that handles both old documents
     * (where 'id' was incorrectly stored as a body field) and new clean ones.
     * Avoids @DocumentId conflict by reading fields manually.
     */
    private User docToUser(DocumentSnapshot doc) {
        if (doc == null || !doc.exists()) return null;
        User user = new User();
        user.setId(doc.getId()); // Always use the Firestore document ID as authoritative source
        user.setName(doc.getString("name"));
        user.setEmail(doc.getString("email"));
        user.setPhone(doc.getString("phone"));
        user.setPasswordHash(doc.getString("passwordHash"));
        String role = doc.getString("role");
        user.setRole(role != null ? role : "USER");
        return user;
    }
}
