package com.homenest.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.math.BigDecimal;
import java.util.List;

/** Typed view of the {@code app.*} settings in application.yml. */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Jwt jwt,
        Cors cors,
        Seed seed,
        Shipping shipping,
        Cloudinary cloudinary,
        Razorpay razorpay,
        Messaging messaging,
        Search search,
        Auth auth) {

    public record Jwt(String secret, long expirationMs) { }

    public record Cors(List<String> allowedOrigins) { }

    public record Seed(boolean enabled, String adminEmail, String adminPassword, String sellerEmail, String sellerPassword) { }

    public record Shipping(BigDecimal freeThreshold, BigDecimal flatFee, String currency) { }

    public record Cloudinary(String cloudName, String apiKey, String apiSecret, String folder) {
        public boolean configured() {
            return hasText(cloudName) && hasText(apiKey) && hasText(apiSecret);
        }
    }

    public record Razorpay(String keyId, String keySecret) {
        public boolean configured() {
            return hasText(keyId) && hasText(keySecret);
        }
    }

    public record Messaging(boolean enabled) { }

    public record Search(Elasticsearch elasticsearch) {
        public record Elasticsearch(boolean enabled, String url, String apiKey, String index) { }
    }

    public record Auth(String googleClientId, Otp otp) { }

    public record Otp(boolean consoleDelivery, int expirationMinutes, String emailFrom,
                      String smsGatewayUrl, String smsGatewayToken) { }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
