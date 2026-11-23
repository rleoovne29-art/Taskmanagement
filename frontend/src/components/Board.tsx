import type { Card, Status } from '../types.ts'
import Column from './Column.tsx'

// 列は固定3つ。status 値はバックエンドの enum（TODO / DOING / DONE）に対応
const COLUMNS: { status: Status; title: string }[] = [
  { status: 'TODO', title: 'To Do' },
  { status: 'DOING', title: 'Doing' },
  { status: 'DONE', title: 'Done' },
]

interface Props {
  cards: Card[]
}

export default function Board({ cards }: Props) {
  return (
    <div className="board">
      {COLUMNS.map(({ status, title }) => (
        <Column key={status} title={title} cards={cards.filter((c) => c.status === status)} />
      ))}
    </div>
  )
}
