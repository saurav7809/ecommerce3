package com.homenest.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OtpChallengeRepository extends JpaRepository<OtpChallenge, Long> {
    List<OtpChallenge> findByUserIdAndPurposeAndConsumedFalseOrderByCreatedAtDesc(Long userId, OtpChallenge.Purpose purpose);
    java.util.Optional<OtpChallenge> findFirstByUserIdAndPurposeOrderByCreatedAtDesc(Long userId, OtpChallenge.Purpose purpose);
}
