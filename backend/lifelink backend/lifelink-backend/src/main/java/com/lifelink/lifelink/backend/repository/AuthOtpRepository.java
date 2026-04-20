package com.lifelink.lifelink.backend.repository;

import com.lifelink.lifelink.backend.entity.AuthOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthOtpRepository extends JpaRepository<AuthOtp, UUID> {
    Optional<AuthOtp> findByPhoneAndOtpCode(String phone, String otpCode);
    void deleteByPhone(String phone);
}
