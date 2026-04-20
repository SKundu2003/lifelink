package com.lifelink.lifelink.backend.service;

import com.lifelink.lifelink.backend.entity.AuthOtp;
import com.lifelink.lifelink.backend.entity.User;
import com.lifelink.lifelink.backend.repository.AuthOtpRepository;
import com.lifelink.lifelink.backend.repository.UserRepository;
import com.lifelink.lifelink.backend.request.OtpRequest;
import com.lifelink.lifelink.backend.request.OtpVerifyRequest;
import com.lifelink.lifelink.backend.response.AuthResponse;
import com.lifelink.lifelink.backend.security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthOtpRepository authOtpRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse requestOtp(OtpRequest request) {
        // Clear any existing OTP for this phone
        authOtpRepository.deleteByPhone(request.getPhone());

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", new Random().nextInt(999999));
        
        AuthOtp authOtp = AuthOtp.builder()
                .phone(request.getPhone())
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        
        authOtpRepository.save(authOtp);
        
        // Ensure user exists or prepare to create on verify (We just log the name for now, actual creation happens on verify if we cache the name, or we just trust the name on request)
        // Wait, the requirement says "Users provide a phone and name. The system should generate a 6-digit OTP... and verify it to issue a JWT".
        // It's better to store the name if we are creating a new user, but since OTP verify doesn't ask for name, we can create the User *now* if it doesn't exist, OR add fullName to AuthOtp.
        // Let's create the user right now if they don't exist, but mark them as incomplete or just create them.
        Optional<User> existingUser = userRepository.findByPhone(request.getPhone());
        if (existingUser.isEmpty()) {
            User newUser = User.builder()
                    .phone(request.getPhone())
                    .fullName(request.getFullName())
                    .uniqueCode(generateUniqueCode())
                    .build();
            userRepository.save(newUser);
        }

        // In a real application, send the OTP via SMS here!
        return AuthResponse.builder()
                .message("OTP generated successfully. In dev mode: " + otpCode)
                .build();
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        Optional<AuthOtp> optionalOtp = authOtpRepository.findByPhoneAndOtpCode(request.getPhone(), request.getOtpCode());
        
        if (optionalOtp.isEmpty() || optionalOtp.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        
        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new RuntimeException("User not found after OTP setup"));
        
        // OTP is valid, clear it
        authOtpRepository.delete(optionalOtp.get());
        
        String jwtToken = jwtUtil.generateToken(user.getId().toString());
        return AuthResponse.builder()
                .token(jwtToken)
                .message("Successfully authenticated")
                .build();
    }

    private String generateUniqueCode() {
        String code = "";
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
