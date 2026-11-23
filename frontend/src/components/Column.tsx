import type { Card as CardData } from '../types.ts'
import Card from './Card.tsx'

interface Props {
  title: string
  cards: CardData[]
}

export default function Column({ title, cards }: Props) {
  return (
    <section className="column" aria-label={title}>
      <div className="column-header">
        <span>{title}</span>
        <span className="column-count">{cards.length}</span>
      </div>
      <div className="card-list">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </section>
  )
}
