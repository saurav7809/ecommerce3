package com.homenest.auth;

import com.homenest.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
public class OtpDeliveryService {
    private static final Logger log = LoggerFactory.getLogger(OtpDeliveryService.class);

    private final AppProperties.Otp config;
    private final JavaMailSender mailSender;
    private final RestClient restClient;

    public OtpDeliveryService(AppProperties properties, JavaMailSender mailSender, RestClient.Builder builder) {
        this.config = properties.auth().otp();
        this.mailSender = mailSender;
        this.restClient = builder.build();
    }

    public void sendEmail(String email, String code, String purpose) {
        String message = "Your HomeNest " + purpose + " code is " + code + ". It expires in "
                + config.expirationMinutes() + " minutes.";
        if (config.consoleDelivery()) {
            log.info("Local-only OTP delivery to {}: {}", email, message);
            return;
        }
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(config.emailFrom());
            mail.setTo(email);
            mail.setSubject("HomeNest verification code");
            mail.setText(message);
            mailSender.send(mail);
        } catch (MailException e) {
            log.warn("Could not send account verification email: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not deliver the verification email. Please try again.");
        }
    }

    public void sendSms(String phone, String code, String purpose) {
        String message = "Your HomeNest " + purpose + " code is " + code + ". It expires in "
                + config.expirationMinutes() + " minutes.";
        if (config.consoleDelivery()) {
            log.info("Local-only OTP delivery to {}: {}", phone, message);
            return;
        }
        if (config.smsGatewayUrl() == null || config.smsGatewayUrl().isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SMS delivery is not configured");
        }
        try {
            restClient.post().uri(config.smsGatewayUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers(headers -> {
                        if (config.smsGatewayToken() != null && !config.smsGatewayToken().isBlank()) {
                            headers.set(HttpHeaders.AUTHORIZATION, "Bearer " + config.smsGatewayToken());
                        }
                    })
                    .body(Map.of("to", phone, "message", message))
                    .retrieve().toBodilessEntity();
        } catch (RestClientException e) {
            log.warn("Could not send account verification SMS", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not deliver the verification SMS. Please try again.");
        }
    }
}
