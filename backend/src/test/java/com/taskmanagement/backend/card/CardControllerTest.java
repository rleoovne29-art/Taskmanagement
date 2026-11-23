package com.taskmanagement.backend.card;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CardController.class)
class CardControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    CardService cardService;

    private CardResponse sample(long id, String title) {
        LocalDateTime now = LocalDateTime.of(2026, 1, 1, 0, 0);
        return new CardResponse(id, title, LocalDate.of(2026, 2, 1), Priority.HIGH, Status.TODO, now, now);
    }

    @Test
    void 全件取得はカードの一覧を返す() throws Exception {
        given(cardService.search(null, null, null)).willReturn(List.of(sample(1, "A"), sample(2, "B")));

        mockMvc.perform(get("/api/cards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].title").value("A"))
                .andExpect(jsonPath("$[1].priority").value("HIGH"));
    }

    @Test
    void 検索条件はサービスへ渡される() throws Exception {
        given(cardService.search("資料", Status.TODO, Priority.HIGH)).willReturn(List.of(sample(1, "資料作成")));

        mockMvc.perform(get("/api/cards")
                        .param("keyword", "資料")
                        .param("status", "TODO")
                        .param("priority", "HIGH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("資料作成"));
    }

    @Test
    void 不正なstatusは400を返す() throws Exception {
        mockMvc.perform(get("/api/cards").param("status", "INVALID"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void ID指定取得は1件を返す() throws Exception {
        given(cardService.findById(1L)).willReturn(sample(1, "A"));

        mockMvc.perform(get("/api/cards/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("TODO"));
    }

    @Test
    void 存在しないIDは404を返す() throws Exception {
        given(cardService.findById(9999L)).willThrow(new CardNotFoundException(9999L));

        mockMvc.perform(get("/api/cards/9999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }
}
