package com.aquawiki.dto;

public record ApiError(int status, String error, String message) {
}
