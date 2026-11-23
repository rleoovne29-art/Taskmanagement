import Column from './Column.jsx'

// 列は固定3つ。status 値はバックエンドの enum（TODO / DOING / DONE）に対応
const COLUMNS = [
  { status: 'TODO', title: 'To Do' },
  { status: 'DOING', title: 'Doing' },
  { status: 'DONE', title: 'Done' },
]

export default function Board({ cards }) {
  return (
    <div className="board">
      {COLUMNS.map(({ status, title }) => (
        <Column key={status} title={title} cards={cards.filter((c) => c.status === status)} />
      ))}
    </div>
  )
}
