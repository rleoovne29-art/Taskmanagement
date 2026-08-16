package com.taskmanagement.backend.card;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CardRequest(
        @NotBlank(message = "タスク名は必須です") String title,
        LocalDate dueDate,
        Priority priority,
        @NotNull(message = "列（ステータス）は必須です") Status status
) {
}
