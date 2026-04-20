package com.lifelink.lifelink.backend.service.impl;

import com.lifelink.lifelink.backend.entity.User;
import com.lifelink.lifelink.backend.entity.UserMetaInfo;
import com.lifelink.lifelink.backend.repository.UserMetaInfoRepository;
import com.lifelink.lifelink.backend.repository.UserRepository;
import com.lifelink.lifelink.backend.request.MetaInfoRequest;
import com.lifelink.lifelink.backend.request.UserRequest;
import com.lifelink.lifelink.backend.response.UserResponse;
import com.lifelink.lifelink.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMetaInfoRepository userMetaInfoRepository;

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .isMinor(request.isMinor())
                .build();

        user = userRepository.save(user);

        UserMetaInfo metaInfo = UserMetaInfo.builder()
                .user(user)
                .dynamicInfo(request.getDynamicInfo())
                // .publicFields(...) could be added to UserRequest but it's not currently there.
                .build();

        userMetaInfoRepository.save(metaInfo);

        return mapToResponse(user, metaInfo);
    }

    @Override
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserMetaInfo metaInfo = userMetaInfoRepository.findByUserId(id)
                .orElse(null);
        return mapToResponse(user, metaInfo);
    }

    @Override
    @Transactional
    public UserResponse updateUserMetaInfo(UUID userId, MetaInfoRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserMetaInfo metaInfo = userMetaInfoRepository.findByUserId(userId)
                .orElseGet(() -> UserMetaInfo.builder().user(user).build());

        metaInfo.setDynamicInfo(request.getDynamicInfo());
        metaInfo.setPublicFields(request.getPublicFields());
        metaInfo = userMetaInfoRepository.save(metaInfo);

        return mapToResponse(user, metaInfo);
    }

    private UserResponse mapToResponse(User user, UserMetaInfo metaInfo) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .uniqueCode(user.getUniqueCode())
                .isMinor(user.isMinor())
                .dynamicInfo(metaInfo != null ? metaInfo.getDynamicInfo() : null)
                .publicFields(metaInfo != null ? metaInfo.getPublicFields() : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
