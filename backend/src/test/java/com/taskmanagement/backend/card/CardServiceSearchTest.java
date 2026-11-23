package com.taskmanagement.backend.card;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class CardServiceSearchTest {

    @Mock
    CardRepository cardRepository;

    @InjectMocks
    CardService cardService;

    private Card card(String title, Priority priority, Status status) {
        return new Card(title, null, priority, status);
    }

    @Test
    void keyword未指定なら全件を返す() {
        given(cardRepository.findAll()).willReturn(List.of(
                card("A", Priority.HIGH, Status.TODO), card("B", Priority.LOW, Status.DONE)));

        assertThat(cardService.search(null, null, null)).hasSize(2);
        assertThat(cardService.search("  ", null, null)).hasSize(2);
    }

    @Test
    void keywordはリポジトリの部分一致検索を使う() {
        given(cardRepository.findByTitleContainingIgnoreCase("資料"))
                .willReturn(List.of(card("資料作成", Priority.HIGH, Status.TODO)));

        assertThat(cardService.search(" 資料 ", null, null))
                .extracting(CardResponse::title)
                .containsExactly("資料作成");
    }

    @Test
    void statusとpriorityで絞り込める() {
        given(cardRepository.findAll()).willReturn(List.of(
                card("A", Priority.HIGH, Status.TODO),
                card("B", Priority.HIGH, Status.DONE),
                card("C", Priority.LOW, Status.TODO)));

        assertThat(cardService.search(null, Status.TODO, Priority.HIGH))
                .extracting(CardResponse::title)
                .containsExactly("A");
    }

    @Test
    void 該当なしは空リストを返す() {
        given(cardRepository.findByTitleContainingIgnoreCase("zzz")).willReturn(List.of());

        assertThat(cardService.search("zzz", null, null)).isEmpty();
    }
}
