package com.foodorder.food_backend.service;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class OtpService {

    private final Firestore firestore;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number:}")
    private String twilioFromNumber;

    private static final long OTP_TTL_MS = 5 * 60 * 1000L; // 5 minutes
    private static final int MAX_OTP_PER_HOUR = 3;

    public OtpService(Firestore firestore) {
        this.firestore = firestore;
    }

    // ---- Generate and Send OTP ----
    public void sendOtp(String phone) throws Exception {
        // Rate limiting: max 3 OTPs per phone per hour
        checkRateLimit(phone);

        // Generate 6-digit OTP
        String otp = String.format("%06d", secureRandom.nextInt(999999));

        // Store OTP in Firestore with TTL
        Map<String, Object> otpRecord = new HashMap<>();
        otpRecord.put("otp", otp);
        otpRecord.put("phone", phone);
        otpRecord.put("createdAt", System.currentTimeMillis());
        otpRecord.put("expiresAt", System.currentTimeMillis() + OTP_TTL_MS);
        otpRecord.put("verified", false);

        firestore.collection("otp_records").document(phone).set(otpRecord).get();

        // Send OTP via Twilio SMS
        sendSmsViaTwilio(phone, otp);
    }

    // ---- Verify OTP ----
    public boolean verifyOtp(String phone, String inputOtp) throws ExecutionException, InterruptedException {
        DocumentSnapshot doc = firestore.collection("otp_records").document(phone).get().get();
        if (!doc.exists()) return false;

        String storedOtp = doc.getString("otp");
        Long expiresAt = doc.getLong("expiresAt");
        Boolean verified = doc.getBoolean("verified");

        if (verified != null && verified) return false; // already used
        if (expiresAt == null || System.currentTimeMillis() > expiresAt) return false; // expired
        if (!inputOtp.equals(storedOtp)) return false; // wrong OTP

        // Mark as verified
        firestore.collection("otp_records").document(phone).update("verified", true).get();
        return true;
    }

    // ---- Rate limiting ----
    private void checkRateLimit(String phone) throws Exception {
        DocumentSnapshot doc = firestore.collection("otp_records").document(phone).get().get();
        if (doc.exists()) {
            Long createdAt = doc.getLong("createdAt");
            if (createdAt != null) {
                long hourAgo = System.currentTimeMillis() - 60 * 60 * 1000L;
                if (createdAt > hourAgo) {
                    Long count = doc.getLong("sendCount");
                    if (count != null && count >= MAX_OTP_PER_HOUR) {
                        throw new Exception("Too many OTP requests. Please try again after 1 hour.");
                    }
                    firestore.collection("otp_records").document(phone).update("sendCount", (count == null ? 0 : count) + 1).get();
                    return;
                }
            }
        }
    }

    // ---- Send SMS via Twilio REST API ----
    private void sendSmsViaTwilio(String phone, String otp) throws Exception {
        if (twilioAccountSid == null || twilioAccountSid.isEmpty()) {
            // Dev mode: print OTP to console
            System.out.println("========================");
            System.out.println("DEV MODE OTP for " + phone + ": " + otp);
            System.out.println("========================");
            return;
        }

        String toPhone = phone.startsWith("+") ? phone : "+91" + phone;

        String body = "Your Gourmet Galaxy verification code is: " + otp +
                "\nValid for 5 minutes. Do not share with anyone.\n- Team Gourmet Galaxy";

        String formData = "To=" + URLEncoder.encode(toPhone, StandardCharsets.UTF_8) +
                "&From=" + URLEncoder.encode(twilioFromNumber, StandardCharsets.UTF_8) +
                "&Body=" + URLEncoder.encode(body, StandardCharsets.UTF_8);

        String credentials = twilioAccountSid + ":" + twilioAuthToken;
        String encodedCreds = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.twilio.com/2010-04-01/Accounts/" + twilioAccountSid + "/Messages.json"))
                .header("Authorization", "Basic " + encodedCreds)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formData))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 400) {
            System.err.println("Twilio SMS error: " + response.body());
            throw new Exception("Failed to send SMS. Please check Twilio configuration.");
        }
    }
}
