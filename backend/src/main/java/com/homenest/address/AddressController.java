package com.homenest.address;

import com.homenest.common.AddressDetails;
import com.homenest.user.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@Tag(name = "Addresses")
public class AddressController {

    public record AddressView(Long id, boolean isDefault, AddressDetails.View address) {
        static AddressView of(Address a) { return new AddressView(a.getId(), a.isDefaultAddress(), a.getDetails().view()); }
    }

    public record SaveAddressRequest(@NotNull @Valid AddressDetails.Input address, boolean makeDefault) { }

    private final AddressRepository addresses;
    private final AddressService service;

    public AddressController(AddressRepository addresses, AddressService service) {
        this.addresses = addresses;
        this.service = service;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<AddressView> list(@AuthenticationPrincipal User user) {
        return addresses.findByUserIdOrderByDefaultAddressDescCreatedAtDesc(user.getId()).stream().map(AddressView::of).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressView create(@AuthenticationPrincipal User user, @Valid @RequestBody SaveAddressRequest request) {
        return AddressView.of(service.save(user.getId(), request.address(), request.makeDefault()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        Address address = addresses.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Address not found"));
        addresses.delete(address);
    }
}
