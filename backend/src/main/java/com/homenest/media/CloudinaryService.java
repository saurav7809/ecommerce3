package com.homenest.media;

import com.homenest.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.Set;

/**
 * Signed server-side uploads to Cloudinary's Upload API. The API secret never leaves the server.
 * https://cloudinary.com/documentation/upload_images#authenticated_requests
 */
@Service
public class CloudinaryService {
    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/avif");

    private final AppProperties.Cloudinary config;
    private final RestClient client;

    public CloudinaryService(AppProperties properties, RestClient.Builder builder) {
        this.config = properties.cloudinary();
        this.client = builder.baseUrl("https://api.cloudinary.com/v1_1").build();
    }

    public boolean configured() {
        return config.configured();
    }

    public String upload(MultipartFile file) {
        if (!config.configured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Image uploads need Cloudinary. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, or paste an image URL instead.");
        }
        if (file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The file is empty");
        if (file.getContentType() == null || !ALLOWED_TYPES.contains(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload a JPEG, PNG, WebP or AVIF image");
        }

        String timestamp = String.valueOf(Instant.now().getEpochSecond());
        String signature = sha1Hex("folder=" + config.folder() + "&timestamp=" + timestamp + config.apiSecret());

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read the uploaded file");
        }
        var form = new LinkedMultiValueMap<String, Object>();
        form.add("file", new ByteArrayResource(bytes) {
            @Override public String getFilename() { return "upload"; }
        });
        form.add("api_key", config.apiKey());
        form.add("timestamp", timestamp);
        form.add("folder", config.folder());
        form.add("signature", signature);

        try {
            Map<?, ?> result = client.post().uri("/{cloud}/image/upload", config.cloudName())
                    .contentType(MediaType.MULTIPART_FORM_DATA).body(form)
                    .retrieve().body(Map.class);
            Object url = result == null ? null : result.get("secure_url");
            if (url == null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Cloudinary did not return an image URL");
            return url.toString();
        } catch (RestClientException e) {
            log.warn("Cloudinary upload failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Image upload failed. Check the Cloudinary credentials.");
        }
    }

    private static String sha1Hex(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-1").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
