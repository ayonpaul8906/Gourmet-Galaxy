package com.foodorder.food_backend.controller;

import com.foodorder.food_backend.JwtUtil;
import com.foodorder.food_backend.model.User;
import com.foodorder.food_backend.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        try {
            String name = body.get("name");
            String email = body.get("email");
            String password = body.get("password");

            if (name == null || email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "name, email and password required"));
            }

            String result = userService.createUser(name, email, password);
            if ("EXISTS".equals(result)) {
                return ResponseEntity.status(409).body(Map.of("error", "User already exists"));
            }
            return ResponseEntity.ok(Map.of("message", "User created", "time", result));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String password = body.get("password");
            if (email == null || password == null) return ResponseEntity.badRequest().body(Map.of("error","email and password required"));

            var user = userService.authenticate(email, password);
            if (user == null) return ResponseEntity.status(401).body(Map.of("error","Invalid credentials"));

            String token = jwtUtil.generateToken(user.getId(), user.getEmail());
            return ResponseEntity.ok(Map.of("token", token, "user", Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail())));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
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
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

