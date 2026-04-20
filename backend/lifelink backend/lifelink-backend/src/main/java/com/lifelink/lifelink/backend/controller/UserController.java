package com.lifelink.lifelink.backend.controller;

import com.lifelink.lifelink.backend.request.MetaInfoRequest;
import com.lifelink.lifelink.backend.request.UserRequest;
import com.lifelink.lifelink.backend.response.UserResponse;
import com.lifelink.lifelink.backend.service.UserService;
import com.lifelink.lifelink.backend.service.QRCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final QRCodeService qrCodeService;

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}/meta-info")
    public ResponseEntity<UserResponse> updateMetaInfo(@PathVariable UUID id, @RequestBody MetaInfoRequest request) {
        return ResponseEntity.ok(userService.updateUserMetaInfo(id, request));
    }

    @GetMapping("/{id}/qr-code")
    public ResponseEntity<byte[]> getQRCode(@PathVariable UUID id) {
        UserResponse user = userService.getUserById(id);
        String scanUrl = "https://lifelink.id/" + user.getUniqueCode();
        byte[] qrCode = qrCodeService.generateQRCode(scanUrl, 350, 350);

        return ResponseEntity.ok()
                .header("Content-Type", "image/png")
                .header("Content-Disposition", "attachment; filename=\"qrcode-" + id + ".png\"")
                .body(qrCode);
    }
}
