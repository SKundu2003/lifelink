package com.lifelink.lifelink.backend.service;

import com.lifelink.lifelink.backend.entity.AuthOtp;
import com.lifelink.lifelink.backend.entity.User;
import com.lifelink.lifelink.backend.exception.ConflictException;
import com.lifelink.lifelink.backend.exception.ResourceNotFoundException;
import com.lifelink.lifelink.backend.repository.AuthOtpRepository;
import com.lifelink.lifelink.backend.repository.UserRepository;
import com.lifelink.lifelink.backend.request.OtpRequest;
import com.lifelink.lifelink.backend.request.OtpVerifyRequest;
import com.lifelink.lifelink.backend.response.AuthResponse;
import com.lifelink.lifelink.backend.security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthOtpRepository authOtpRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse requestOtp(OtpRequest request) {
        // Check for duplicate email (if provided and new user)
        boolean phoneExists = userRepository.findByPhone(request.getPhone()).isPresent();
        if (!phoneExists) {
            if (StringUtils.hasText(request.getEmail())
                    && userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new ConflictException("An account with this email already exists");
            }
            if (StringUtils.hasText(request.getUsername())
                    && userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new ConflictException("This username is already taken");
            }
        }

        // Clear any existing OTP for this phone
        authOtpRepository.deleteByPhone(request.getPhone());

        // Hardcoded OTP for dev/testing
        String otpCode = "000000";

        AuthOtp authOtp = AuthOtp.builder()
                .phone(request.getPhone())
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();

        authOtpRepository.save(authOtp);

        if (!phoneExists) {
            // New User flow: fullName is mandatory
            if (!StringUtils.hasText(request.getFullName())) {
                throw new IllegalArgumentException("User not found. Please provide your full name to register.");
            }

            User newUser = User.builder()
                    .phone(request.getPhone())
                    .fullName(request.getFullName())
                    .email(StringUtils.hasText(request.getEmail()) ? request.getEmail() : null)
                    .username(StringUtils.hasText(request.getUsername()) ? request.getUsername() : null)
                    .isMinor(Boolean.TRUE.equals(request.getIsMinor()))
                    .uniqueCode(generateUniqueCode())
                    .build();
            userRepository.save(newUser);
        }

        return AuthResponse.builder()
                .message("OTP generated successfully. In dev mode: " + otpCode)
                .build();
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        if (!StringUtils.hasText(request.getPhone())) {
            throw new IllegalArgumentException("Phone number is required");
        }
        if (!StringUtils.hasText(request.getOtpCode()) || request.getOtpCode().length() != 6) {
            throw new IllegalArgumentException("OTP must be exactly 6 digits");
        }
        if (!request.getOtpCode().matches("\\d{6}")) {
            throw new IllegalArgumentException("OTP must contain only digits");
        }

        Optional<AuthOtp> optionalOtp = authOtpRepository.findByPhoneAndOtpCode(
                request.getPhone(), request.getOtpCode());

        if (optionalOtp.isEmpty()) {
            throw new IllegalArgumentException("Invalid OTP. Please check the code and try again.");
        }
        if (optionalOtp.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            authOtpRepository.delete(optionalOtp.get());
            throw new IllegalArgumentException("OTP has expired. Please request a new one.");
        }

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("User not found. Please register first."));

        authOtpRepository.delete(optionalOtp.get());

        String jwtToken = jwtUtil.generateToken(user.getId().toString());
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId().toString())
                .message("Successfully authenticated")
                .build();
    }

    private String generateUniqueCode() {
        String code;
        do {
            code = "LL-" + generateRandomString(5);
        } while (userRepository.findByUniqueCode(code).isPresent());
        return code;
    }

    private String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
