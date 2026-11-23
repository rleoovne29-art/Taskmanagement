import Card from './Card.jsx'

export default function Column({ title, cards }) {
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
