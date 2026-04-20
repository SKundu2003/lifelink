package com.lifelink.lifelink.backend.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private boolean isMinor;
    private Map<String, Object> dynamicInfo;
}
