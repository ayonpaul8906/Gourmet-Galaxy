package com.foodorder.food_backend.controller;

import com.foodorder.food_backend.JwtUtil;
import com.foodorder.food_backend.model.User;
import com.foodorder.food_backend.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    private String sanitizeInput(String input) {
        if (input == null) return "";
        // Strip XSS script tags and trim whitespace
        return input.replaceAll("<[^>]*>", "").trim();
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        try {
            String name = sanitizeInput(body.get("name"));
            String email = sanitizeInput(body.get("email")).toLowerCase();
            String password = body.get("password");

            if (name.isEmpty() || email.isEmpty() || password == null || password.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name, valid email and password are required"));
            }

            if (!EMAIL_PATTERN.matcher(email).matches()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
            }

            if (password.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters long"));
            }

            String result = userService.createUser(name, email, password);
            if ("EXISTS".equals(result)) {
                return ResponseEntity.status(409).body(Map.of("error", "User already exists"));
            }
            return ResponseEntity.ok(Map.of("message", "User created", "time", result));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "An internal error occurred"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email = sanitizeInput(body.get("email")).toLowerCase();
            String password = body.get("password");

            if (email.isEmpty() || password == null || password.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
            }

            var user = userService.authenticate(email, password);
            if (user == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
            }

            String token = jwtUtil.generateToken(user.getId(), user.getEmail());
            return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail())
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Authentication error"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile(@RequestAttribute(name="userId", required=false) String userId) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthenticated"));
        try {
            User user = userService.getUserById(userId);
            if (user == null) return ResponseEntity.status(404).body(Map.of("error", "User not found"));
            return ResponseEntity.ok(Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Error fetching profile"));
        }
    }
}
