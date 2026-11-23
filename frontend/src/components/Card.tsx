import type { Card as CardData, Priority } from '../types.ts'

const PRIORITY_LABELS: Record<Priority, string> = { HIGH: '高', MEDIUM: '中', LOW: '低' }

interface Props {
  card: CardData
}

export default function Card({ card }: Props) {
  const priority = card.priority ?? 'MEDIUM'
  return (
    <div className={`card priority-${priority.toLowerCase()}`}>
      <p className="card-title">{card.title}</p>
      <div className="card-meta">
        <span className="card-priority">優先度: {PRIORITY_LABELS[priority] ?? priority}</span>
        {card.dueDate && <span className="card-due">期限: {card.dueDate}</span>}
      </div>
    </div>
  )
}
