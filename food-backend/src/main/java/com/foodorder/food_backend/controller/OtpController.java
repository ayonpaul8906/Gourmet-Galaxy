package com.foodorder.food_backend.controller;

import com.foodorder.food_backend.JwtUtil;
import com.foodorder.food_backend.model.User;
import com.foodorder.food_backend.service.OtpService;
import com.foodorder.food_backend.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class OtpController {

    private final OtpService otpService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    private static final Pattern PHONE_PATTERN = Pattern.compile("^[6-9]\\d{9}$");
    private static final Pattern OTP_PATTERN = Pattern.compile("^\\d{6}$");

    public OtpController(OtpService otpService, UserService userService, JwtUtil jwtUtil) {
        this.otpService = otpService;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * POST /api/auth/send-otp
     * Body: { "phone": "9876543210" }
     * Sends real OTP via Twilio SMS (or prints to console in dev mode)
     */
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String phone = body.getOrDefault("phone", "").trim().replaceAll("\\D", "");

        if (!PHONE_PATTERN.matcher(phone).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid Indian mobile number. Must be 10 digits starting with 6-9."));
        }

        try {
            otpService.sendOtp(phone);

            // Check if user already exists
            User existing = userService.findByPhone(phone);
            boolean isNewUser = (existing == null);

            return ResponseEntity.ok(Map.of(
                "message", "OTP sent successfully to +91" + phone,
                "isNewUser", isNewUser
            ));
        } catch (Exception e) {
            return ResponseEntity.status(429).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/auth/verify-otp
     * Body: { "phone": "9876543210", "otp": "123456" }
     * Returns JWT if user exists, or signals new user for name collection
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String phone = body.getOrDefault("phone", "").trim().replaceAll("\\D", "");
        String otp = body.getOrDefault("otp", "").trim();

        if (!PHONE_PATTERN.matcher(phone).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid phone number"));
        }
        if (!OTP_PATTERN.matcher(otp).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP format"));
        }

        try {
            boolean valid = otpService.verifyOtp(phone, otp);
            if (!valid) {
                return ResponseEntity.status(401).body(Map.of("error", "Incorrect or expired OTP. Please try again."));
            }

            // Check if user exists
            User user = userService.findByPhone(phone);
            if (user != null) {
                // Existing user — return JWT
                String token = jwtUtil.generateToken(user.getId(), user.getPhone() != null ? user.getPhone() : user.getEmail());
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "isNewUser", false,
                    "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName() != null ? user.getName() : "",
                        "phone", user.getPhone() != null ? user.getPhone() : "",
                        "email", user.getEmail() != null ? user.getEmail() : ""
                    )
                ));
            } else {
                // New user — needs name
                return ResponseEntity.ok(Map.of(
                    "isNewUser", true,
                    "message", "OTP verified. Please enter your name to complete signup."
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Verification error: " + e.getMessage()));
        }
    }

    /**
     * POST /api/auth/complete-signup
     * Body: { "phone": "9876543210", "name": "Ayon Paul" }
     * Creates user and returns JWT
     */
    @PostMapping("/complete-signup")
    public ResponseEntity<?> completeSignup(@RequestBody Map<String, String> body) {
        String phone = body.getOrDefault("phone", "").trim().replaceAll("\\D", "");
        String name = body.getOrDefault("name", "").trim()
                .replaceAll("<[^>]*>", "") // XSS protection
                .replaceAll("[^\\w\\s\\u0900-\\u097F'-]", ""); // allow Indian chars

        if (!PHONE_PATTERN.matcher(phone).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid phone number"));
        }
        if (name.isEmpty() || name.length() < 2) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name must be at least 2 characters"));
        }
        if (name.length() > 60) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name is too long"));
        }

        try {
            User user = userService.createUserByPhone(phone, name);
            String token = jwtUtil.generateToken(user.getId(), phone);

            return ResponseEntity.ok(Map.of(
                "token", token,
                "message", "Account created successfully!",
                "user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "phone", user.getPhone() != null ? user.getPhone() : phone,
                    "email", ""
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to create account: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/auth/update-profile
     * Updates user's name (no OTP needed)
     */
    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(
            @RequestAttribute(name = "userId", required = false) String userId,
            @RequestBody Map<String, String> body) {
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthenticated"));

        String name = body.getOrDefault("name", "").trim();
        if (!name.isEmpty() && name.length() >= 2) {
            try {
                userService.updateUserName(userId, name);
            } catch (Exception e) {
                return ResponseEntity.status(500).body(Map.of("error", "Failed to update name"));
            }
        }

        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }
}
