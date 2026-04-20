package com.lifelink.lifelink.backend.service;

import com.lifelink.lifelink.backend.request.MetaInfoRequest;
import com.lifelink.lifelink.backend.request.UserRequest;
import com.lifelink.lifelink.backend.response.UserResponse;

import java.util.UUID;

public interface UserService {
    UserResponse createUser(UserRequest request);
    UserResponse getUserById(UUID id);
    UserResponse updateUserMetaInfo(UUID userId, MetaInfoRequest request);
}
