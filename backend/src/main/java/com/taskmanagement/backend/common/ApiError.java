package com.taskmanagement.backend.common;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiError(
        LocalDateTime timestamp,
        int status,
        String message,
        Map<String, String> fieldErrors
) {
    public static ApiError of(int status, String message) {
        return new ApiError(LocalDateTime.now(), status, message, Map.of());
    }

    public static ApiError of(int status, String message, Map<String, String> fieldErrors) {
        return new ApiError(LocalDateTime.now(), status, message, fieldErrors);
    }
}
