package com.foodorder.food_backend;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    // Use a strong random secret in production and move to environment variable
    private final Key key;
    private final long jwtExpirationMs = 1000L * 60 * 60 * 24; // 24 hours

    public JwtUtil() {
        // For demonstration: generate key from a fixed secret. Replace with env var in prod.
        String secret = System.getenv("JWT_SECRET");
        if (secret == null || secret.length() < 32) {
            // fallback (not secure) for local dev: use generated key
            this.key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        } else {
            this.key = Keys.hmacShaKeyFor(secret.getBytes());
        }
    }

    public String generateToken(String userId, String email) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key)
                .compact();
    }

    public String validateAndGetUserId(String token) {
        try {
            Jws<Claims> claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return claims.getBody().getSubject();
        } catch (JwtException e) {
            return null;
        }
    }
}

