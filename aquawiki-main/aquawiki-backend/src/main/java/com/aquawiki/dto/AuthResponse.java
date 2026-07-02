package com.aquawiki.dto;

public record AuthResponse(String token, UserDto user) {

    public record UserDto(Long id, String email, String displayName, String role) {}
}
