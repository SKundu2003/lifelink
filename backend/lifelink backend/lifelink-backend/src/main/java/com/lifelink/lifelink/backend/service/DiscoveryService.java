package com.lifelink.lifelink.backend.service;

import com.lifelink.lifelink.backend.entity.AccessLog;
import com.lifelink.lifelink.backend.entity.User;
import com.lifelink.lifelink.backend.entity.UserMetaInfo;
import com.lifelink.lifelink.backend.repository.AccessLogRepository;
import com.lifelink.lifelink.backend.repository.UserMetaInfoRepository;
import com.lifelink.lifelink.backend.exception.ResourceNotFoundException;
import com.lifelink.lifelink.backend.repository.UserRepository;
import com.lifelink.lifelink.backend.response.UserResponse;
import org.springframework.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DiscoveryService {

    private final UserRepository userRepository;
    private final UserMetaInfoRepository userMetaInfoRepository;
    private final AccessLogRepository accessLogRepository;

    @Transactional
    public UserResponse getPublicProfile(String uniqueCode, String ipAddress, String userAgent) {
        if (!StringUtils.hasText(uniqueCode)) {
            throw new IllegalArgumentException("Identity code is required");
        }
        if (!uniqueCode.matches("^[A-Z0-9]{2}-[A-Z0-9]{3,10}$")) {
            throw new IllegalArgumentException("Invalid identity code format");
        }

        // 1. Log the access attempt
        AccessLog logEntry = AccessLog.builder()
                .uniqueCode(uniqueCode)
                .ipAddress(ipAddress != null ? ipAddress : "unknown")
                .userAgent(userAgent)
                .build();
        accessLogRepository.save(logEntry);

        // 2. Fetch User and MetaInfo
        User user = userRepository.findByUniqueCode(uniqueCode)
                .orElseThrow(() -> new ResourceNotFoundException("No LifeLink profile found for code: " + uniqueCode));

        UserMetaInfo metaInfo = userMetaInfoRepository.findByUserId(user.getId())
                .orElse(null);

        // 3. Privacy Filter logic based on Auth status
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAuthenticatedUser = auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser");
        // Additional check: are they the owner? If so, they see everything. Normally responders also see everything (if there was a Responder role), but instructions say: "By default, sensitive fields (like full phone number) are hidden unless it's a 'Responder' or 'Owner' session." Since we only have owners securely authenticated here, we will just use isAuthenticatedUser as a check.
        boolean isOwner = isAuthenticatedUser && auth.getPrincipal().toString().equals(user.getId().toString());

        Map<String, Object> filteredDynamicInfo = new HashMap<>();
        List<String> publicFields = metaInfo != null ? metaInfo.getPublicFields() : null;

        if (metaInfo != null && metaInfo.getDynamicInfo() != null) {
            if (isOwner) {
                filteredDynamicInfo = metaInfo.getDynamicInfo();
            } else {
                if (publicFields != null) {
                    for (String key : publicFields) {
                        if (metaInfo.getDynamicInfo().containsKey(key)) {
                            filteredDynamicInfo.put(key, metaInfo.getDynamicInfo().get(key));
                        }
                    }
                }
            }
        }

        String phone = user.getPhone();
        if (!isOwner && phone != null && phone.length() > 4) {
            phone = "******" + phone.substring(phone.length() - 4);
        }

        return UserResponse.builder()
                .id(user.getId())
                .username(isOwner ? user.getUsername() : null)
                .email(isOwner ? user.getEmail() : null)
                .fullName(user.getFullName())
                .phone(phone)
                .uniqueCode(user.getUniqueCode())
                .isMinor(user.isMinor())
                .dynamicInfo(filteredDynamicInfo)
                .publicFields(publicFields)
                .createdAt(isOwner ? user.getCreatedAt() : null)
                .updatedAt(isOwner ? user.getUpdatedAt() : null)
                .build();
    }
}
