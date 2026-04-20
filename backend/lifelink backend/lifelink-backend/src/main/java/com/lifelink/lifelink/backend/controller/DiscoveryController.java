package com.lifelink.lifelink.backend.controller;

import com.lifelink.lifelink.backend.response.UserResponse;
import com.lifelink.lifelink.backend.service.DiscoveryService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    @GetMapping("/{code}")
    public ResponseEntity<UserResponse> getPublicProfile(@PathVariable String code, HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        return ResponseEntity.ok(discoveryService.getPublicProfile(code, ipAddress, userAgent));
    }
}
