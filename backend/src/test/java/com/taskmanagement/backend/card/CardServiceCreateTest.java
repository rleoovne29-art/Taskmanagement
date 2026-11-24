package com.taskmanagement.backend.card;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class CardServiceCreateTest {

    @Mock
    CardRepository cardRepository;

    @InjectMocks
    CardService cardService;

    @Test
    void status未指定ならTODOで登録される() {
        given(cardRepository.save(any(Card.class))).willAnswer(inv -> inv.getArgument(0));

        CardResponse response = cardService.create(new CardRequest("資料作成", LocalDate.of(2026, 12, 1), Priority.HIGH, null));

        assertThat(response.status()).isEqualTo(Status.TODO);
        assertThat(response.title()).isEqualTo("資料作成");
        assertThat(response.dueDate()).isEqualTo(LocalDate.of(2026, 12, 1));
        assertThat(response.priority()).isEqualTo(Priority.HIGH);
    }

    @Test
    void priority未指定ならMEDIUMで登録される() {
        given(cardRepository.save(any(Card.class))).willAnswer(inv -> inv.getArgument(0));

        CardResponse response = cardService.create(new CardRequest("A", null, null, null));

        assertThat(response.priority()).isEqualTo(Priority.MEDIUM);
        assertThat(response.dueDate()).isNull();
    }

    @Test
    void タイトルの前後の空白は除去される() {
        given(cardRepository.save(any(Card.class))).willAnswer(inv -> inv.getArgument(0));

        CardResponse response = cardService.create(new CardRequest("  A  ", null, null, Status.DOING));

        assertThat(response.title()).isEqualTo("A");
        assertThat(response.status()).isEqualTo(Status.DOING);
    }
}
