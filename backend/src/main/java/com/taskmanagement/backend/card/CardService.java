package com.taskmanagement.backend.card;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CardService {

    private final CardRepository cardRepository;

    public CardService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /**
     * カードを検索する。条件はすべて任意で、未指定（null・空白）の条件は無視する。
     * keyword はタイトルの部分一致（大文字小文字を区別しない）。
     */
    public List<CardResponse> search(String keyword, Status status, Priority priority) {
        List<Card> cards = (keyword == null || keyword.isBlank())
                ? cardRepository.findAll()
                : cardRepository.findByTitleContainingIgnoreCase(keyword.trim());
        return cards.stream()
                .filter(card -> status == null || card.getStatus() == status)
                .filter(card -> priority == null || card.getPriority() == priority)
                .map(CardResponse::from)
                .toList();
    }

    public CardResponse findById(Long id) {
        return cardRepository.findById(id)
                .map(CardResponse::from)
                .orElseThrow(() -> new CardNotFoundException(id));
    }

    @Transactional
    public CardResponse create(CardRequest request) {
        Card card = new Card(request.title(), request.dueDate(), request.priority(), request.status());
        Card saved = cardRepository.save(card);
        return CardResponse.from(saved);
    }

    @Transactional
    public CardResponse update(Long id, CardRequest request) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new CardNotFoundException(id));
        card.setTitle(request.title());
        card.setDueDate(request.dueDate());
        card.setPriority(request.priority());
        card.setStatus(request.status());
        return CardResponse.from(card);
    }

    @Transactional
    public void delete(Long id) {
        if (!cardRepository.existsById(id)) {
            throw new CardNotFoundException(id);
        }
        cardRepository.deleteById(id);
    }
}
