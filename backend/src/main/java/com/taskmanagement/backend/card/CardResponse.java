package com.taskmanagement.backend.card;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CardResponse(
        Long id,
        String title,
        LocalDate dueDate,
        Priority priority,
        Status status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CardResponse from(Card card) {
        return new CardResponse(
                card.getId(),
                card.getTitle(),
                card.getDueDate(),
                card.getPriority(),
                card.getStatus(),
                card.getCreatedAt(),
                card.getUpdatedAt()
        );
    }
}
