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

    public List<CardResponse> findAll() {
        return cardRepository.findAll().stream()
                .map(CardResponse::from)
                .toList();
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
