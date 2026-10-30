package store.commongoods.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StoreUserRepository extends JpaRepository<StoreUser, Long> { Optional<StoreUser> findByEmailIgnoreCase(String email); boolean existsByEmailIgnoreCase(String email); }
