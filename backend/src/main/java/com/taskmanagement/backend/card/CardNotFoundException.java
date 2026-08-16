package com.taskmanagement.backend.card;

public class CardNotFoundException extends RuntimeException {

    public CardNotFoundException(Long id) {
        super("指定したカードが見つかりません（id=" + id + "）");
    }
}
