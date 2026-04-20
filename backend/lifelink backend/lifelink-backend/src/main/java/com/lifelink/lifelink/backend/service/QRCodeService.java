package com.lifelink.lifelink.backend.service;

public interface QRCodeService {
    byte[] generateQRCode(String text, int width, int height);
}
