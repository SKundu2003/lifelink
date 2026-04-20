package com.lifelink.lifelink.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String uniqueCode;
    private boolean isMinor;
    private Map<String, Object> dynamicInfo;
    private java.util.List<String> publicFields;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
