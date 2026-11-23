package com.taskmanagement.backend.card;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByTitleContainingIgnoreCase(String keyword);
}
