package com.homenest.common;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/** Postal address used by saved addresses and as the shipping address snapshot on orders. */
@Embeddable
public class AddressDetails implements Serializable {

    /** Validated request shape; converted to the embeddable with {@link #toEmbeddable()}. */
    public record Input(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Pattern(regexp = "^[0-9+ -]{7,20}$", message = "must be a valid phone number") String phone,
            @NotBlank @Size(max = 200) String line1,
            @Size(max = 200) String line2,
            @NotBlank @Size(max = 80) String city,
            @NotBlank @Size(max = 80) String state,
            @NotBlank @Pattern(regexp = "^[A-Za-z0-9 -]{3,12}$", message = "must be a valid postal code") String postalCode,
            @NotBlank @Size(max = 60) String country) {

        public AddressDetails toEmbeddable() {
            return new AddressDetails(fullName.trim(), phone.trim(), line1.trim(), line2 == null ? null : line2.trim(),
                    city.trim(), state.trim(), postalCode.trim(), country.trim());
        }
    }

    public record View(String fullName, String phone, String line1, String line2, String city, String state,
                       String postalCode, String country) implements Serializable { }

    @Column(nullable = false, length = 120) private String fullName;
    @Column(nullable = false, length = 20) private String phone;
    @Column(nullable = false, length = 200) private String line1;
    @Column(length = 200) private String line2;
    @Column(nullable = false, length = 80) private String city;
    @Column(nullable = false, length = 80) private String state;
    @Column(nullable = false, length = 12) private String postalCode;
    @Column(nullable = false, length = 60) private String country;

    protected AddressDetails() { }

    public AddressDetails(String fullName, String phone, String line1, String line2, String city, String state,
                          String postalCode, String country) {
        this.fullName = fullName;
        this.phone = phone;
        this.line1 = line1;
        this.line2 = line2;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
        this.country = country;
    }

    public View view() {
        return new View(fullName, phone, line1, line2, city, state, postalCode, country);
    }

    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
}
