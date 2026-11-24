package com.taskmanagement.backend.card;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * @param status 任意。登録時に未指定なら TODO、更新時に未指定なら現在の列を維持する
 */
public record CardRequest(
        @NotBlank(message = "タスク名は必須です")
        @Size(max = 255, message = "タスク名は255文字以内で入力してください") String title,
        LocalDate dueDate,
        Priority priority,
        Status status
) {
}
