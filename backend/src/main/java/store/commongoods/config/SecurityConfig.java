package store.commongoods.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import store.commongoods.auth.JwtAuthenticationFilter;
import store.commongoods.auth.StoreUserRepository;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean public UserDetailsService userDetailsService(StoreUserRepository users) { return email -> users.findByEmailIgnoreCase(email).orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Account not found")); }
    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception { return config.getAuthenticationManager(); }
    @Bean public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwt, CorsConfigurationSource cors) throws Exception {
        return http.csrf(c -> c.disable()).cors(c -> c.configurationSource(cors)).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a.requestMatchers("/api/health", "/actuator/health", "/api/auth/**").permitAll().requestMatchers(HttpMethod.GET,"/api/products/**","/api/orders/*").permitAll().requestMatchers(HttpMethod.POST,"/api/orders","/api/payments/razorpay/order","/api/payments/razorpay/verify").permitAll().anyRequest().authenticated())
            .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class).build();
    }
    @Bean public CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origin}") String origin) { CorsConfiguration config=new CorsConfiguration();config.setAllowedOrigins(List.of(origin));config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));config.setAllowedHeaders(List.of("Authorization","Content-Type"));config.setAllowCredentials(true);UrlBasedCorsConfigurationSource source=new UrlBasedCorsConfigurationSource();source.registerCorsConfiguration("/api/**",config);return source; }
}
