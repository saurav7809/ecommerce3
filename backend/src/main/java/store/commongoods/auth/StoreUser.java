package store.commongoods.auth;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.Instant;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "store_users")
public class StoreUser implements UserDetails {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 100) private String name;
    @Column(nullable = false, unique = true, length = 190) private String email;
    @Column(nullable = false) private String passwordHash;
    @Column(nullable = false, length = 30) private String role = "CUSTOMER";
    @Column(nullable = false) private Instant createdAt = Instant.now();
    protected StoreUser() { }
    public StoreUser(String name, String email, String passwordHash) { this.name = name; this.email = email.toLowerCase(); this.passwordHash = passwordHash; }
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(new SimpleGrantedAuthority("ROLE_" + role)); }
    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
