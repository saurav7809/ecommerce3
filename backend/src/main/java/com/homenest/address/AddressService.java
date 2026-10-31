package com.homenest.address;

import com.homenest.common.AddressDetails;
import com.homenest.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AddressService {
    static final int MAX_ADDRESSES = 10;

    private final AddressRepository addresses;
    private final UserRepository users;

    public AddressService(AddressRepository addresses, UserRepository users) {
        this.addresses = addresses;
        this.users = users;
    }

    /** Saves an address for the user. Used by the address book and by checkout ("save this address"). */
    @Transactional
    public Address save(Long userId, AddressDetails.Input input, boolean makeDefault) {
        long existing = addresses.countByUserId(userId);
        if (existing >= MAX_ADDRESSES) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You can save up to " + MAX_ADDRESSES + " addresses");
        }
        boolean isDefault = makeDefault || existing == 0;
        if (isDefault) addresses.clearDefault(userId);
        return addresses.save(new Address(users.getReferenceById(userId), input.toEmbeddable(), isDefault));
    }
}
